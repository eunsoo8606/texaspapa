require('dotenv').config();
const db = require('./config/database');

async function fixDatabase() {
    try {
        console.log('🚀 Starting database fix...');

        // Check if session_id column exists
        const [columns] = await db.query('SHOW COLUMNS FROM visitor_logs LIKE "session_id"');

        if (columns.length === 0) {
            console.log('➕ Adding session_id column to visitor_logs...');
            await db.query('ALTER TABLE `visitor_logs` ADD COLUMN `session_id` VARCHAR(255) NULL DEFAULT NULL AFTER `company_id`');
            await db.query('ALTER TABLE `visitor_logs` ADD INDEX `idx_session_id` (`session_id`)');
            console.log('✅ session_id column added successfully.');
        } else {
            console.log('ℹ️ session_id column already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Database fix failed:', error);
        process.exit(1);
    }
}

fixDatabase();
