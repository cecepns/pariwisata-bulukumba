import bcrypt from 'bcryptjs';

// Password yang diinginkan (ganti sesuai kebutuhan)
const plainPassword = 'admin123';

// Hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Main function
async function main() {
    console.log('=== Password Generator untuk Database ===\n');
    
    const hashedPassword = await hashPassword(plainPassword);
    
    console.log('Password yang dihasilkan:');
    console.log(`Plain Password: ${plainPassword}`);
    console.log(`Hashed Password: ${hashedPassword}`);
    console.log();
    
    console.log('SQL untuk database:');
    console.log(`INSERT INTO admin (username, password) VALUES ('admin', '${hashedPassword}');`);
    console.log();
    
    console.log('Atau update password existing:');
    console.log(`UPDATE admin SET password = '${hashedPassword}' WHERE username = 'admin';`);
    console.log();
    
    console.log('=== Selesai ===');
}

// Jalankan script
main().catch(console.error);
