const express = require('express');
const router = express.Router();
const {pool} = require('../db');

// POST /register
// POST /register
router.post('/register', async (req, res) => {
    const { name, email, angles } = req.body;

    if (!name || !email || !Array.isArray(angles) || angles.length !== 3) {
        return res.status(400).json({
            error: 'Invalid input. Name, email and 3 angles required.'
        });
    }

    try {
        const anglesJson = JSON.stringify(angles);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, salt, reactor_config) VALUES (?, ?, ?, ?)',
            [name, email, 'default-salt', anglesJson]  // Added salt field and changed reactor_angles to reactor_config
        );

        res.json({
            success: true,
            message: 'User registered.',
            userId: result.insertId
        });

    } catch (err) {
        console.error('Register Error:', err);

        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists.' });
        }

        res.status(500).json({ error: 'Database error.', details: err.message });  // Added details for debugging
    }
});

// POST /login
// POST /login
router.post('/login', async (req, res) => {
    const { email, angles } = req.body;

    if (!email || !Array.isArray(angles) || angles.length !== 3) {
        return res.status(400).json({ error: 'Invalid input.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'User not found.' });
        }

        const user = rows[0];
        
        // DEBUG: Log what's actually in the user object
        console.log('User from DB:', user);

       let dbAngles = typeof user.reactor_config === 'string'
    ? JSON.parse(user.reactor_config)
    : user.reactor_config;

        const TOLERANCE = 15;

        const isMatch = angles.every((inputAngle, index) => {
            let diff = Math.abs(dbAngles[index] - inputAngle);
            if (diff > 180) diff = 360 - diff;
            return diff <= TOLERANCE;
        });

        if (!isMatch) {
            return res.status(401).json({
                error: 'Reactor alignment failed.',
                details: 'Tolerance exceeded.'
            });
        }

        res.json({
            success: true,
            token: 'jwt-placeholder-token-' + Date.now(),
            user: {
                id: user.id,
                name: user.name || 'Unknown Operator',  // Add fallback
                email: user.email
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
