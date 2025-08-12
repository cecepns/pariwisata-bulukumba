// ANCHOR: Attractions controller
// Provides public fetch and admin CRUD for attractions.
import { query } from '../config.js';

export async function getAllAttractions(req, res) {
  try {
    const rows = await query(
      `SELECT a.*, c.name AS category_name
       FROM attractions a
       LEFT JOIN categories c ON c.id = a.category_id
       ORDER BY a.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllAttractions error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getAttractionById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT a.*, c.name AS category_name
       FROM attractions a
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.id = ?
       LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getAttractionById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createAttraction(req, res) {
  try {
    const {
      category_id,
      name,
      description,
      ticket_price,
      operational_hours,
      facilities,
      gmaps_iframe_url,
      cover_image_url,
    } = req.body || {};

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const result = await query(
      `INSERT INTO attractions
      (category_id, name, description, ticket_price, operational_hours, facilities, gmaps_iframe_url, cover_image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id || null,
        name,
        description || null,
        ticket_price || null,
        operational_hours || null,
        facilities || null,
        gmaps_iframe_url || null,
        cover_image_url || null,
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('createAttraction error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateAttraction(req, res) {
  try {
    const { id } = req.params;
    const fields = [
      'category_id',
      'name',
      'description',
      'ticket_price',
      'operational_hours',
      'facilities',
      'gmaps_iframe_url',
      'cover_image_url',
    ];

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
    await query(`UPDATE attractions SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('updateAttraction error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteAttraction(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM attractions WHERE id = ?', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteAttraction error', err);
    res.status(500).json({ message: 'Server error' });
  }
}


