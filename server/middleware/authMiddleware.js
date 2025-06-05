const jwt = require('jsonwebtoken');
const { User } = require('../db').models; // Access User model via db.js

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_for_development';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required. Please login.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists (optional, but good practice)
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'username', 'email'] // Select only necessary fields
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found. Invalid token.' });
    }

    req.user = user; // Attach user object (without password) to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login.' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Error authenticating token.' });
  }
};

module.exports = authMiddleware;