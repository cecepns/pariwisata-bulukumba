// ANCHOR: Galleries controller
// Provides public fetch and admin CRUD for gallery items.
import { query } from '../config.js';

export async function getAllGalleries(req, res) {
  try {
    const rows = await query('SELECT * FROM galleries ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('getAllGalleries error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createGallery(req, res) {
  try {
    const { image_url, caption } = req.body || {};
    if (!image_url) return res.status(400).json({ message: 'image_url is required' });
    const result = await query(
      `INSERT INTO galleries (image_url, caption) VALUES (?, ?)`,
      [image_url, caption || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('createGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateGallery(req, res) {
  try {
    const { id } = req.params;
    const fields = ['image_url', 'caption'];
    const updates = [];
    const params = [];
    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    params.push(id);
    await query(`UPDATE galleries SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('updateGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteGallery(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM galleries WHERE id = ?', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}


