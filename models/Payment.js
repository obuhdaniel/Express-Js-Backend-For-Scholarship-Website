const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Payment = sequelize.define('Payment', {
  applicationNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Payment;
