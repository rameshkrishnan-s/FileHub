const jwt = require('jsonwebtoken');
const pool = require('../db/db');
const secret = process.env.JWT_SECRET || 'supersecret';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

  const token = authHeader.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Token missing.' });

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token.' });

    try {
      // Get user details from database using raw MySQL
      const [users] = await pool.execute(
        "SELECT id, email, name, role_id FROM users WHERE id = ?",
        [decoded.id]
      );
      
      if (users.length === 0) return res.status(401).json({ message: 'User not found.' });
      
      const user = users[0];

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role_id,
        name: user.name
      };

      next();
    } catch (dbErr) {
      console.error('Database error in auth middleware:', dbErr);
      return res.status(500).json({ message: 'Database error.' });
    }
  });
};
