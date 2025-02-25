'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      // A Device belongs to an InvitedUser (One-to-One)
      Device.belongsTo(models.InvitedUser, { 
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // A Device belongs to a Parent User (One-to-Many)
      Device.belongsTo(models.User, {
        foreignKey: 'parentId',
        as: 'parent',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  Device.init(
    {
      deviceName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Invited User is optional
        unique: true, // Ensures one InvitedUser has only one Device
        references: {
          model: 'InvitedUsers',
          key: 'id',
        },
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Parent User is optional
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'Device',
      tableName: 'Devices',
      timestamps: true,
    }
  );

  return Device;
};
