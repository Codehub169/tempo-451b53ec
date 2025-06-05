const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_username',
        msg: 'Username already exists.',
      },
      validate: {
        notEmpty: {
          msg: 'Username cannot be empty.',
        },
        len: {
          args: [3, 30],
          msg: 'Username must be between 3 and 30 characters.',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_email',
        msg: 'Email already in use.',
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address.',
        },
        notEmpty: {
          msg: 'Email cannot be empty.',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password cannot be empty.',
        },
      },
    },
  }, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
    // Optional: To prevent Sequelize from pluralizing the table name
    // freezeTableName: true,
  });

  return User;
};