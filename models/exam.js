
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  examDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  examDetails: DataTypes.JSON,
  examStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
});

Exam.belongsTo(User);
User.hasMany(Exam);

module.exports = Exam;
