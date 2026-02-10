const sqlite3 = require('sqlite3').verbose();

// Simulated pool query for SQLite
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('/tmp/secure_vault.db');
        
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            db.all(sql, params, (err, rows) => {
                db.close();
                if (err) reject(err);
                else resolve([rows, []]);
            });
        } else {
            db.run(sql, params, function (err) {
                db.close();
                if (err) reject(err);
                else resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]);
            });
        }
    });
};

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, angles } = req.body;

    if (!name || !email || !Array.isArray(angles) || angles.length !== 3) {
        return res.status(400).json({
            error: 'Invalid input. Name, email and 3 angles required.'
        });
    }

    try {
        const anglesJson = JSON.stringify(angles);

        const [result] = await query(
            'INSERT INTO users (name, email, salt, reactor_config) VALUES (?, ?, ?, ?)',
            [name, email, 'default-salt', anglesJson]
        );

        res.status(200).json({
            success: true,
            message: 'User registered.',
            userId: result.insertId
        });

    } catch (err) {
        console.error('Register Error:', err);

        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists.' });
        }

        res.status(500).json({ error: 'Database error.', details: err.message });
    }
};