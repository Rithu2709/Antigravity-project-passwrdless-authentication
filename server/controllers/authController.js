const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Helper to calculate shortest distance between two angles (circular math)
const getAngleDistance = (a1, a2) => {
    let diff = Math.abs(a1 - a2) % 360;
    return diff > 180 ? 360 - diff : diff;
};

// Tolerance for the reactor core (in degrees)
const TOLERANCE = 15;

exports.register = async (req, res) => {
    const { name, email, reactorConfig } = req.body;

    if (!name || !email || !reactorConfig || !Array.isArray(reactorConfig) || reactorConfig.length !== 3) {
        return res.status(400).json({ message: 'Invalid input. reactorConfig must be an array of 3 angles.' });
    }

    try {
        // Check if user exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Generate a random salt (simulating security enhancement)
        const salt = await bcrypt.genSalt(10);

        // Store configuration as JSON. 
        // Note: For a real high-security app, we might encrypt this data.
        // We store it directly here to allow for the tolerance comparison logic.
        const configJson = JSON.stringify(reactorConfig);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, salt, reactor_config) VALUES (?, ?, ?, ?)',
            [name, email, salt, configJson]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.authenticate = async (req, res) => {
    const { email, reactorConfig } = req.body;

    if (!email || !reactorConfig || !Array.isArray(reactorConfig) || reactorConfig.length !== 3) {
        return res.status(400).json({ message: 'Invalid input.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Authentication failed. User not found.' });
        }

        const user = users[0];

        let storedConfig = user.reactor_config;
        // SQLite stores JSON as text, so we must parse it if it's a string
        if (typeof storedConfig === 'string') {
            try {
                storedConfig = JSON.parse(storedConfig);
            } catch (e) {
                console.error('Error parsing reactor_config:', e);
                return res.status(500).json({ message: 'Data corruption detected.' });
            }
        }

        // Verify angles with tolerance
        // We assume the order matters (Inner, Middle, Outer)
        const isMatch = reactorConfig.every((angle, index) => {
            const storedAngle = storedConfig[index];
            const distance = getAngleDistance(angle, storedAngle);
            return distance <= TOLERANCE;
        });

        if (!isMatch) {
            return res.status(401).json({ message: 'Reactor breach! Access denied.', details: 'Angular misalignment detected.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Reactor Core Online. Access Granted.', token, user: { id: user.id, name: user.name, email: user.email } });

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Server error during authentication.' });
    }
};

exports.getSecrets = async (req, res) => {
    // req.user is populated by middleware
    try {
        const [secrets] = await pool.query('SELECT * FROM secrets WHERE user_id = ?', [req.user.id]);
        res.json(secrets);
    } catch (error) {
        console.error('Error fetching secrets:', error);
        res.status(500).json({ message: 'Server error fetching secrets.' });
    }
};
