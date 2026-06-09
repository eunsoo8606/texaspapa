const db = require('../config/database');

async function checkTables() {
    try {
        const [tables] = await db.query('SHOW TABLES');
        console.log('--- TABLES ---');
        console.log(tables);

        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await db.query(`SHOW COLUMNS FROM \`${tableName}\``);
            console.log(`\n--- COLUMNS FOR ${tableName} ---`);
            console.log(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key })));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTables();
