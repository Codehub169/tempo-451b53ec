const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Score = sequelize.define('Score', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gameName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Game name cannot be empty.',
        },
      },
    },
    scoreValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'Score value must be an integer.',
        },
        min: {
          args: [0],
          msg: 'Score value cannot be negative.',
        },
      },
    },
    // userId is automatically added by Sequelize due to the association in db.js
    // but it's good practice to be aware of it. If you needed to define it explicitly:
    // userId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'Users', // Name of the table
    //     key: 'id',
    //   },
    //   allowNull: false,
    // },
  }, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  });

  return Score;
};