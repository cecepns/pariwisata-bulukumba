// ANCHOR: Express server for Bulukumba Tourism API
// Sets up public and admin routes, CORS, and DB bootstrap.
import express from 'express';
// import cors from 'cors';
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { pool, query } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import publicAttractions from './routes/attractions.js';
import publicEvents from './routes/events.js';
import publicGalleries from './routes/galleries.js';
import adminRoutes from './routes/admin.js';

// dotenv.config();

const app = express.Router();
// app.use(cors());
// app.use(express.json());
// app.use(morgan('dev'));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads-bukukumba-wisata')));

// app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Public API
app.use('/api/attractions', publicAttractions);
app.use('/api/events', publicEvents);
app.use('/api/gallery', publicGalleries);

// Admin API
app.use('/api/admin', adminRoutes);

module.exports = app;

// const PORT = process.env.PORT || 5000;

// async function ensureDatabaseConnection() {
//   const conn = await pool.getConnection();
//   await conn.ping();
//   conn.release();
// }

// async function seedDefaultAdminIfEnabled() {
//   const { SEED_ADMIN_ON_STARTUP = 'true', ADMIN_USERNAME = 'admin', ADMIN_PASSWORD = 'admin123' } = process.env;
//   if (SEED_ADMIN_ON_STARTUP !== 'true') return;

//   const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
//   const existing = await query('SELECT id_admin FROM admin WHERE username = ? LIMIT 1', [ADMIN_USERNAME]);
//   if (!existing || existing.length === 0) {
//     await query('INSERT INTO admin (username, password) VALUES (?, ?)', [ADMIN_USERNAME, hashed]);
//     console.log(`Seeded admin ${ADMIN_USERNAME}`);
//     return;
//   }
//   const adminId = existing[0].id_admin;
//   await query('UPDATE admin SET password = ? WHERE id_admin = ?', [hashed, adminId]);
//   console.log(`Updated admin password for ${ADMIN_USERNAME}`);
// }

// app.listen(PORT, async () => {
//   try {
//     await ensureDatabaseConnection();
//     await seedDefaultAdminIfEnabled();
//     console.log(`Server listening on http://localhost:${PORT}`);
//   } catch (err) {
//     console.error('Startup error:', err);
//     process.exit(1);
//   }
// });


