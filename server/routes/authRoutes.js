const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../db'); // Assuming db.js exports models and sequelize instance correctly
const { Op } = require('sequelize'); // Explicitly import Op for clarity

const router = express.Router();

// Align default JWT_SECRET with authMiddleware.js
// It's crucial that JWT_SECRET is the same here as in your token verification (authMiddleware.js)
// Best practice: Set this in your .env file for production and ensure it's a strong, random string.
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_for_development';

// POST /api/auth/register - User Registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Basic input validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  // Consider adding more specific validation for email format, password strength, username length/characters
  // although some of this might be handled by Sequelize model validations.

  try {
    // Check if user already exists (by username or email)
    // Using a single query for efficiency if specific error messages for email vs username aren't critical
    // Otherwise, two separate queries as implemented are fine for clearer feedback.
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Return relevant user information (excluding password)
    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });

  } catch (error) {
    // Log the detailed error for server-side debugging
    console.error('Registration error:', error);
    // Check for Sequelize validation errors to provide more specific feedback if desired
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    } 
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    // Generic error message for other cases
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// POST /api/auth/login - User Login
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ message: 'Email/Username and password are required.' });
  }

  try {
    // Find user by email or username
    // User.sequelize.Op.or is valid if Op is on the sequelize instance from User model
    // Alternatively, import Op directly from 'sequelize' and use it.
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });

    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Generic message
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      username: user.username,
      // email: user.email // Optionally include email if needed in the token, consider payload size
    };
    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour. Consider making this configurable.
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user.id, username: user.username, email: user.email }, // Return relevant user info
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

module.exports = router;
