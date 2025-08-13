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
