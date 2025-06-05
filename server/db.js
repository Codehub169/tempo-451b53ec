const { Sequelize } = require('sequelize');
const path = require('path');

// Define the path to the SQLite database file in the project root
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Initialize Sequelize with SQLite dialect
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath, // Path to the database file
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL queries in development
});

// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to SQLite has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the SQLite database:', error);
  }
}

testConnection();

// Define an object to hold our models once they are defined
const db = {
  sequelize,    // Sequelize instance
  Sequelize,    // Sequelize library
  User: null,     // Placeholder for User model
  Score: null    // Placeholder for Score model
};

// Import models (they will associate themselves with this Sequelize instance)
// We will define these models in separate files and import them here.
db.User = require('./models/User')(sequelize, Sequelize.DataTypes);
db.Score = require('./models/Score')(sequelize, Sequelize.DataTypes);

// Define associations if any (e.g., User has many Scores)
if (db.User && db.Score) {
  db.User.hasMany(db.Score, { foreignKey: 'userId', onDelete: 'CASCADE' });
  db.Score.belongsTo(db.User, { foreignKey: 'userId' });
}

module.exports = db;
