const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const InstitutionalDetails = sequelize.define('InstitutionalDetails', {
  institutionName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  faculty: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  matricNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  degreeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  yearOfAdmission: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expectedGradYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currentSemester: {
    type: DataTypes.ENUM('1st', '2nd'),
    allowNull: false,
  },
  cgpa: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  jambRegNo: {
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

User.hasOne(InstitutionalDetails, { foreignKey: 'userId' });
InstitutionalDetails.belongsTo(User, { foreignKey: 'userId' });

module.exports = InstitutionalDetails;
