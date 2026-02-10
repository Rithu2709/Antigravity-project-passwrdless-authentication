require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const seed = async () => {
    console.log('Starting database seed...');

    // Create connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true // Enable multiple statements for schema import
    });

    try {
        console.log('Connected to MySQL.');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await connection.query(schema);
        console.log('Schema executed successfully!');

        console.log('Database initialized.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await connection.end();
    }
};

seed();
