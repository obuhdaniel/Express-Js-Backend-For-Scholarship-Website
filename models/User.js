const {DataTypes} = require('sequelize');

const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,

    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
       
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    profileDetails: DataTypes.JSON,

});


module.exports = User;