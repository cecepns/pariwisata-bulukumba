// ANCHOR: Categories controller
// Provides endpoints for fetching categories (mapped to table `kategori`).
import { query } from '../config.js';

export async function getAllCategories(req, res) {
  try {
    const rows = await query(
      `SELECT
         id_kategori,
         nama_kategori,
         deskripsi,
         gambar
       FROM kategori
       ORDER BY nama_kategori ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllCategories error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT
         id_kategori,
         nama_kategori,
         deskripsi,
         gambar
       FROM kategori
       WHERE id_kategori = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('getCategoryById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, description, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }
    
    const result = await query(
      `INSERT INTO kategori (nama_kategori, deskripsi, gambar)
       VALUES (?, ?, ?)`,
      [name, description || null, image || null]
    );
    
    res.status(201).json({
      id_kategori: result.insertId,
      nama_kategori: name,
      deskripsi: description,
      gambar: image,
      message: 'Kategori berhasil ditambahkan'
    });
  } catch (err) {
    console.error('createCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }
    
    const result = await query(
      `UPDATE kategori 
       SET nama_kategori = ?, deskripsi = ?, gambar = ?
       WHERE id_kategori = ?`,
      [name, description || null, image || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    res.json({
      id_kategori: id,
      nama_kategori: name,
      deskripsi: description,
      gambar: image,
      message: 'Kategori berhasil diperbarui'
    });
  } catch (err) {
    console.error('updateCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    
    // Check if category is being used by attractions
    const attractions = await query(
      `SELECT COUNT(*) as count FROM wisata WHERE id_kategori = ?`,
      [id]
    );
    
    if (attractions[0].count > 0) {
      return res.status(400).json({ 
        message: 'Kategori tidak dapat dihapus karena masih digunakan oleh objek wisata' 
      });
    }
    
    const result = await query(
      `DELETE FROM kategori WHERE id_kategori = ?`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error('deleteCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
}