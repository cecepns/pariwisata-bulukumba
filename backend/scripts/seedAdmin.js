// ANCHOR: Seed/Update default admin credentials
// Usage: npm run seed:admin
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../config.js';

dotenv.config();

async function main() {
  const { ADMIN_EMAIL = 'admin@pariwisata.go.id', ADMIN_PASSWORD = 'admin123' } = process.env;
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await query('SELECT id FROM admins WHERE email = ? LIMIT 1', [ADMIN_EMAIL]);
  if (!existing || existing.length === 0) {
    await query('INSERT INTO admins (email, password) VALUES (?, ?)', [ADMIN_EMAIL, hashed]);
    console.log(`Seeded admin ${ADMIN_EMAIL}`);
  } else {
    const id = existing[0].id;
    await query('UPDATE admins SET password = ? WHERE id = ?', [hashed, id]);
    console.log(`Updated admin password for ${ADMIN_EMAIL}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


