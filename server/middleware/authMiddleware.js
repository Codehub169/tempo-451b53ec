const jwt = require('jsonwebtoken');
const { User } = require('../db'); // Access User model via db.js

// It's crucial that JWT_SECRET is the same here as in your token signing (e.g., authRoutes.js)
// Best practice: Set this in your .env file for production.
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_for_development';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required. Please login.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists (good practice)
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'username', 'email'] // Select only necessary fields, exclude password
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found. Invalid token.' });
    }

    // Attach user object (id, username, email) to the request object
    // req.user should contain what was stored in the token (userId, username) plus email if fetched
    // For consistency with token creation, ensure req.user has at least userId and username.
    // The current setup attaches the Sequelize user model instance (with selected attributes).
    req.user = {
        userId: user.id, // Matching the payload structure { userId: user.id, username: user.username }
        username: user.username,
        email: user.email
        // You can attach the full user model instance if preferred: req.user = user;
        // However, for security and consistency, explicitly defining what's attached is better.
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login.' });
    }
    // Log unexpected errors for server-side debugging
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Error authenticating token. Please try again later.' });
  }
};

module.exports = authMiddleware;
