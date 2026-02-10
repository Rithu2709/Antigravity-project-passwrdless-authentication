const mysql = require('mysql2/promise');
require('dotenv').config();

// Standard connection config
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    // Do NOT specify database yet to check if it exists
};

async function check() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL server.');

        const [dbs] = await connection.query('SHOW DATABASES LIKE "reactor_auth"');
        if (dbs.length === 0) {
            console.error('❌ Database "reactor_auth" does NOT exist.');
            console.log('   Run: mysql -u root -p < server/schema.sql');
            process.exit(1);
        }
        console.log('✅ Database "reactor_auth" found.');

        await connection.changeUser({ database: 'reactor_auth' });

        const [tables] = await connection.query('SHOW TABLES LIKE "users"');
        if (tables.length === 0) {
            console.error('❌ Table "users" does NOT exist.');
            console.log('   Run: mysql -u root -p < server/schema.sql');
            process.exit(1);
        }
        console.log('✅ Table "users" found.');

        console.log('System ready.');

    } catch (err) {
        console.error('❌ Error checking database:', err);
    } finally {
        if (connection) await connection.end();
    }
}

check();
