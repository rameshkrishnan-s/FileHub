const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'supersecret';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

  const token = authHeader.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Token missing.' });

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token.' });

    // Attach user info to request
    req.user = {
      email: decoded.email, 
      role: decoded.role
    };

    next();
  });
};
