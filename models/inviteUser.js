// models/InvitedUser.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a sequelize instance

const InvitedUser = sequelize.define('InvitedUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  type: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue:2,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'User', 
      key: 'id',
    },
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: true, // Only for children
  },
  tracker_device_id: {
    type: DataTypes.STRING,
    allowNull: true, // Optional for children
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true, // Optional for children
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Default to current time
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Default to current time
  },
}, {
  timestamps: false, // Assuming you have no auto timestamps for this table
});

module.exports = InvitedUser;
