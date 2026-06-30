require('dotenv').config({ path: '../.env' });
const db = require('../config/database');

async function check() {
    try {
        console.log('--- Companies ---');
        const [companies] = await db.query('SELECT * FROM company');
        console.log(companies);

        console.log('--- Admins ---');
        const [admins] = await db.query('SELECT username, admin_name, role, company_id, is_active FROM admins');
        console.log(admins);

        console.log('--- Boards ---');
        const [boards] = await db.query('SELECT * FROM boards');
        console.log(boards);

        console.log('--- Distinct categories and company_ids ---');
        const [dist] = await db.query('SELECT DISTINCT company_id, category FROM boards');
        console.log(dist);

        process.exit(0);
    } catch (e) {
        console.error('Error during check:', e);
        process.exit(1);
    }
}

check();
