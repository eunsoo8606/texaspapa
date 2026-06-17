require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/database');
const bcrypt = require('bcrypt');

async function updatePassword() {
    try {
        const username = 'texaspapa';
        const rawPassword = '123456';
        
        console.log(`Hashing password for admin user: ${username}...`);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        
        console.log('Updating database...');
        // Let's first check if the admin exists
        const [users] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
        if (users.length === 0) {
            console.error(`Error: Admin user '${username}' not found in 'admins' table.`);
            process.exit(1);
        }
        
        const [result] = await db.query(
            'UPDATE admins SET password = ? WHERE username = ?',
            [hashedPassword, username]
        );
        
        console.log('Result:', result);
        console.log(`Successfully updated password for ${username} to ${rawPassword}`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

updatePassword();
