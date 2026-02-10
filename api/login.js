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

// Helper to calculate shortest distance between two angles
const getAngleDistance = (a1, a2) => {
    let diff = Math.abs(a1 - a2) % 360;
    return diff > 180 ? 360 - diff : diff;
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

    const { email, angles } = req.body;

    if (!email || !Array.isArray(angles) || angles.length !== 3) {
        return res.status(400).json({ error: 'Invalid input.' });
    }

    try {
        const [rows] = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'User not found.' });
        }

        const user = rows[0];

        let dbAngles = typeof user.reactor_config === 'string'
            ? JSON.parse(user.reactor_config)
            : user.reactor_config;

        const TOLERANCE = 15;

        const isMatch = angles.every((inputAngle, index) => {
            const distance = getAngleDistance(inputAngle, dbAngles[index]);
            return distance <= TOLERANCE;
        });

        if (!isMatch) {
            return res.status(401).json({
                error: 'Reactor alignment failed.',
                details: 'Tolerance exceeded.'
            });
        }

        res.status(200).json({
            success: true,
            token: 'jwt-placeholder-token-' + Date.now(),
            user: {
                id: user.id,
                name: user.name || 'Unknown Operator',
                email: user.email
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error.', details: err.message });
    }
};