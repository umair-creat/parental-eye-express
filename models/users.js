'use strict';
const { role } = require('../constants');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: role.user,
    },
    forgetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
    {
      sequelize,
      modelName: 'User',
      tableName: "Users",
      timestamps: true,
    });
  return User;
};