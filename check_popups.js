const db = require('./config/database');

async function checkPopups() {
    try {
        const [rows] = await db.query('SELECT * FROM popups');
        console.log('--- All Popups ---');
        console.table(rows.map(r => ({
            id: r.id,
            title: r.title,
            active: r.is_active,
            start: r.start_date ? r.start_date.toISOString().split('T')[0] : 'NULL',
            end: r.end_date ? r.end_date.toISOString().split('T')[0] : 'NULL'
        })));

        const now = new Date().toISOString().split('T')[0];
        const [active] = await db.query(
            `SELECT id FROM popups 
             WHERE is_active = 1 
             AND (start_date IS NULL OR start_date <= CURDATE())
             AND (end_date IS NULL OR end_date >= CURDATE())`
        );
        console.log(`\n--- Active Popups for CURDATE() ---`);
        console.log('Count:', active.length);
        console.log('IDs:', active.map(a => a.id).join(', '));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPopups();
