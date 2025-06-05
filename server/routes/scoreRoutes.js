const express = require('express');
const { Score, User } = require('../db'); // Assuming db.js exports models correctly
const authMiddleware = require('../middleware/authMiddleware'); // Middleware to protect routes

const router = express.Router();

// POST /api/scores - Submit a new score (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  const { gameName, scoreValue } = req.body;
  const userId = req.user.userId; // Extracted from JWT by authMiddleware

  if (!gameName || scoreValue === undefined || scoreValue === null) {
    return res.status(400).json({ message: 'Game name and score value are required.' });
  }
  if (typeof scoreValue !== 'number') {
    return res.status(400).json({ message: 'Score value must be a number.' });
  }

  try {
    const newScore = await Score.create({
      gameName,
      score: scoreValue,
      userId,
    });

    res.status(201).json({
      message: 'Score submitted successfully!',
      score: newScore,
    });

  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ message: 'Server error during score submission.', error: error.message });
  }
});

// GET /api/scores/:gameName - Get top scores for a specific game
router.get('/:gameName', async (req, res) => {
  const { gameName } = req.params;
  const limit = parseInt(req.query.limit) || 10; // Default to top 10 scores, allow query param to change

  if (!gameName) {
    return res.status(400).json({ message: 'Game name parameter is required.' });
  }

  try {
    const topScores = await Score.findAll({
      where: { gameName },
      order: [['score', 'DESC']], // Order by score in descending order
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

// GET /api/scores/user/:userId - Get all scores for a specific user (optional - requires auth or admin)
// This is an example, might need different auth logic depending on requirements
router.get('/user/:userId', authMiddleware, async (req, res) => {
    const requestedUserId = parseInt(req.params.userId);
    const authenticatedUserId = req.user.userId; // from JWT

    // Optional: Allow users to see only their own scores, or admins to see any.
    // For now, let's assume users can only fetch their own scores.
    if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: 'Forbidden: You can only view your own scores.' });
    }

    try {
        const userScores = await Score.findAll({
            where: { userId: requestedUserId },
            order: [['createdAt', 'DESC']], // Or by gameName, then score, etc.
            include: [{ model: User, attributes: ['username'] }]
        });
        res.status(200).json(userScores);
    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ message: 'Server error fetching user scores.', error: error.message });
    }
});

module.exports = router;
