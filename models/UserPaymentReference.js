// models/UserPaymentReference.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Import User model

const UserPaymentReference = sequelize.define('UserPaymentReference', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  referenceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure reference numbers are unique
  },
}, {
  timestamps: true,
  tableName: 'user_payment_references', // Name of the table in the database
});

module.exports = UserPaymentReference;
