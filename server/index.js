require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./db');
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

// Serve static files from the React frontend app
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuildPath));

// SPA fallback: For any other request, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      // If index.html is not found (e.g., during initial build or if path is wrong)
      // send a more informative error or a simple message.
      if (err.status === 404) {
        res.status(404).send('Frontend build not found. Please run `npm run build` in the /frontend directory.');
      } else {
        res.status(500).send('Error serving frontend.');
      }
    }
  });
});

const PORT = process.env.PORT || 9000;

// Sync database and start server
sequelize.sync() // Use { force: true } during development to drop and recreate tables
  .then(() => {
    console.log('Database synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend should be accessible at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database or start server:', err);
  });

module.exports = app; // Export for potential testing
