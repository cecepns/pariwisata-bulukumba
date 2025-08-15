// ANCHOR: Galleries controller
// Provides public fetch and admin CRUD for gallery items (mapped to table `galeri`).
import { query } from '../config.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getAllGalleries(req, res) {
  try {
    const rows = await query(
      `SELECT 
         g.id_galeri,
         g.id_wisata,
         g.gambar,
         g.keterangan,
         g.nama,
         w.nama_wisata
       FROM galeri g
       LEFT JOIN wisata w ON g.id_wisata = w.id_wisata
       ORDER BY g.id_galeri DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllGalleries error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createGallery(req, res) {
  try {
    const { id_wisata, gambar, keterangan, nama } = req.body || {};
    if (!id_wisata) return res.status(400).json({ message: 'id_wisata is required' });
    if (!gambar) return res.status(400).json({ message: 'gambar is required' });
    const result = await query(
      `INSERT INTO galeri (id_wisata, gambar, keterangan, nama) VALUES (?, ?, ?, ?)`,
      [id_wisata, gambar, keterangan || null, nama || null]
    );
    res.status(201).json({ id_galeri: result.insertId });
  } catch (err) {
    console.error('createGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateGallery(req, res) {
  try {
    const { id } = req.params;
    const { id_wisata, gambar, keterangan, nama } = req.body;
    
    // If updating image, get the old image path to delete it later
    let oldImagePath = null;
    if (gambar !== undefined) {
      const oldData = await query('SELECT gambar FROM galeri WHERE id_galeri = ?', [id]);
      if (oldData.length > 0) {
        oldImagePath = oldData[0].gambar;
      }
    }
    
    const updates = [];
    const params = [];
    
    if (id_wisata !== undefined) {
      updates.push('id_wisata = ?');
      params.push(id_wisata);
    }
    if (gambar !== undefined) {
      updates.push('gambar = ?');
      params.push(gambar);
    }
    if (keterangan !== undefined) {
      updates.push('keterangan = ?');
      params.push(keterangan);
    }
    if (nama !== undefined) {
      updates.push('nama = ?');
      params.push(nama);
    }
    
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    params.push(id);
    await query(`UPDATE galeri SET ${updates.join(', ')} WHERE id_galeri = ?`, params);
    
    // Delete old image file if it was updated and it's a local file
    if (oldImagePath && gambar !== undefined && oldImagePath !== gambar && oldImagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '../uploads', path.basename(oldImagePath));
      
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted old file: ${fullPath}`);
        } catch (fileErr) {
          console.error('Error deleting old file:', fileErr);
          // Don't fail the request if file deletion fails
        }
      }
    }
    
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('updateGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getGalleryById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT 
         g.id_galeri,
         g.id_wisata,
         g.gambar,
         g.keterangan,
         g.nama
       FROM galeri g
       WHERE g.id_galeri = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('getGalleryById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteGallery(req, res) {
  try {
    const { id } = req.params;
    
    // First, get the gallery data to know which file to delete
    const galleryData = await query('SELECT gambar FROM galeri WHERE id_galeri = ?', [id]);
    
    if (galleryData.length === 0) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    const imagePath = galleryData[0].gambar;
    
    // Delete from database first
    await query('DELETE FROM galeri WHERE id_galeri = ?', [id]);
    
    // If the image path is a local file (starts with /uploads/), delete the physical file
    if (imagePath && imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '../uploads', path.basename(imagePath));
      
      // Check if file exists and delete it
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted file: ${fullPath}`);
        } catch (fileErr) {
          console.error('Error deleting file:', fileErr);
          // Don't fail the request if file deletion fails
        }
      }
    }
    
    res.json({ message: 'Gallery and associated file deleted successfully' });
  } catch (err) {
    console.error('deleteGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}


