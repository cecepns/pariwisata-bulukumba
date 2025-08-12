// ANCHOR: Admin controller (authentication)
// Handles admin login and token generation using the new `admin` table schema.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config.js';

export async function login(req, res) {
  try {
    const { password } = req.body || {};
    const username = (req.body && (req.body.username || req.body.email)) || '';

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admins = await query(
      'SELECT id_admin AS id, username, password FROM admin WHERE username = ? LIMIT 1',
      [username]
    );
    if (!admins || admins.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const admin = admins[0];
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const token = jwt.sign({ id: admin.id, username: admin.username }, secret, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}


