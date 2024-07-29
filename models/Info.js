const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Info = sequelize.define('Info', {
  middleName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passportPhoto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stateOfOrigin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lgaOfOrigin: {
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

User.hasOne(Info, { foreignKey: 'userId' });
Info.belongsTo(User, { foreignKey: 'userId' });

module.exports = Info;
