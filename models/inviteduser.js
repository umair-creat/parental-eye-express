'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvitedUser extends Model {
    static associate(models) {
      InvitedUser.belongsTo(models.User, {
        foreignKey: 'parentId',
        as: 'parent',
      });

      // Each InvitedUser has one Device
      InvitedUser.hasOne(models.Device, {
        foreignKey: 'userId',
        as: 'device',
        onDelete: 'CASCADE',
      });
    

    }
  }

  InvitedUser.init({
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trackerDeviceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
createdAt: DataTypes.DATE,
updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'InvitedUser',
    tableName: 'InvitedUsers',
    timestamps: true,
  });

  return InvitedUser;
};
