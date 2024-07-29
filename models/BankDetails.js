const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const BankDetails = sequelize.define('BankDetails', {
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
});

User.hasOne(BankDetails, { foreignKey: 'userId' });
BankDetails.belongsTo(User, { foreignKey: 'userId' });

module.exports = BankDetails;
