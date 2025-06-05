const express = require('express');
const { Score, User } = require('../db'); // Assuming db.js exports models correctly
const authMiddleware = require('../middleware/authMiddleware'); // Middleware to protect routes
const { Op } = require('sequelize');

const router = express.Router();

// POST /api/scores - Submit a new score (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  const { gameName, scoreValue } = req.body;
  const userId = req.user.userId; // Extracted from JWT by authMiddleware

  if (!gameName || typeof gameName !== 'string' || gameName.trim() === '') {
    return res.status(400).json({ message: 'Game name must be a non-empty string.' });
  }
  if (scoreValue === undefined || scoreValue === null) {
    return res.status(400).json({ message: 'Score value is required.' });
  }
  if (typeof scoreValue !== 'number' || !Number.isFinite(scoreValue)) {
    return res.status(400).json({ message: 'Score value must be a finite number.' });
  }
  // Consider adding min/max score validation if applicable per game

  try {
    const newScore = await Score.create({
      gameName: gameName.trim(), // Trim gameName
      scoreValue: scoreValue, 
      userId,
    });

    res.status(201).json({
      message: 'Score submitted successfully!',
      score: newScore,
    });

  } catch (error) {
    console.error('Score submission error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error.', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error during score submission.', error: error.message });
  }
});

// GET /api/scores/:gameName - Get top scores for a specific game
router.get('/:gameName', async (req, res) => {
  const { gameName } = req.params;
  let limit = parseInt(req.query.limit, 10) || 10; // Default to top 10 scores

  if (!gameName || typeof gameName !== 'string' || gameName.trim() === '') {
    return res.status(400).json({ message: 'Game name parameter must be a non-empty string.' });
  }

  // Sanitize limit to a reasonable range
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100; // Max limit to prevent abuse

  try {
    const topScores = await Score.findAll({
      where: { gameName: gameName.trim() }, // Trim gameName for query
      order: [['scoreValue', 'DESC']], 
      limit: limit,
      include: [{
        model: User,
        attributes: ['id', 'username'], // Only include user's id and username
      }],
    });

    res.status(200).json(topScores);

  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ message: 'Server error while fetching scores.', error: error.message });
  }
});

// GET /api/scores/user/:userId - Get all scores for a specific user
router.get('/user/:userId', authMiddleware, async (req, res) => {
    const requestedUserIdParam = req.params.userId;
    const authenticatedUserId = req.user.userId;

    // Validate that requestedUserIdParam is a positive integer string
    if (!/^[1-9]\d*$/.test(requestedUserIdParam)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
    }
    const requestedUserId = parseInt(requestedUserIdParam, 10);

    // Users can only fetch their own scores.
    // Admin role for fetching others' scores could be added here if needed.
    if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: 'Forbidden: You can only view your own scores.' });
    }

    try {
        const userScores = await Score.findAll({
            where: { userId: requestedUserId },
            order: [['createdAt', 'DESC']], // Or by gameName, then scoreValue, etc.
            include: [{ model: User, attributes: ['username'] }] // Only username needed here
        });
        res.status(200).json(userScores);
    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ message: 'Server error fetching user scores.', error: error.message });
    }
});

module.exports = router;
