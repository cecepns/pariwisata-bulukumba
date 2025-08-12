// ANCHOR: Events controller
// Provides public fetch and admin CRUD for events.
import { query } from '../config.js';

export async function getAllEvents(req, res) {
  try {
    const rows = await query('SELECT * FROM events ORDER BY event_date DESC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error('getAllEvents error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createEvent(req, res) {
  try {
    const { name, description, event_date, location, image_url } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const result = await query(
      `INSERT INTO events (name, description, event_date, location, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, event_date || null, location || null, image_url || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('createEvent error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const fields = ['name', 'description', 'event_date', 'location', 'image_url'];
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
    await query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('updateEvent error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteEvent error', err);
    res.status(500).json({ message: 'Server error' });
  }
}


