// ANCHOR: Seed/Update default admin credentials (new schema)
// Usage: npm run seed:admin
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../config.js';

dotenv.config();

async function main() {
  const { ADMIN_USERNAME = 'admin', ADMIN_PASSWORD = 'admin123' } = process.env;
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await query('SELECT id_admin FROM admin WHERE username = ? LIMIT 1', [ADMIN_USERNAME]);
  if (!existing || existing.length === 0) {
    await query('INSERT INTO admin (username, password) VALUES (?, ?)', [ADMIN_USERNAME, hashed]);
    console.log(`Seeded admin ${ADMIN_USERNAME}`);
  } else {
    const id = existing[0].id_admin;
    await query('UPDATE admin SET password = ? WHERE id_admin = ?', [hashed, id]);
    console.log(`Updated admin password for ${ADMIN_USERNAME}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


