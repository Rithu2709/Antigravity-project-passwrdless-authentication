const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../secure_vault.db'); // Changed path

// Delete old database file if it exists
if (fs.existsSync(dbPath)) {
    console.log('Deleting old database...');
    fs.unlinkSync(dbPath);
}

// Initialize DB connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeSchema();
    }
});

// Helper to wrap sqlite3 in promises to match mysql2 interface
const pool = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            // Handle INSERT/UPDATE (run) vs SELECT (all)
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve([rows, []]); // mysql2 returns [rows, fields]
                });
            } else {
                db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]);
                });
            }
        });
    },
    getConnection: () => {
        return Promise.resolve({
            release: () => { }
        });
    }
};

// Auto-initialize tables
function initializeSchema() {
    const usersTable = `
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        salt TEXT NOT NULL,
        reactor_config TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

    const secretsTable = `
    CREATE TABLE secrets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        encrypted_data TEXT NOT NULL,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;

    db.serialize(() => {
        db.run(usersTable, (err) => {
            if (err) console.error('Error creating users table:', err);
            else console.log('Users table created successfully');
        });
        db.run(secretsTable, (err) => {
            if (err) console.error('Error creating secrets table:', err);
            else console.log('Secrets table created successfully');
        });
    });
}

module.exports = { pool };