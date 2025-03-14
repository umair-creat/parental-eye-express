'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      // A Location belongs to a Device
      Location.belongsTo(models.Device, {
        foreignKey: 'device_id',
        as: 'device',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Location.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      device_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      location: {
        type: DataTypes.GEOMETRY('POINT', 4326),
        allowNull: false,
      },
      location_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // 1 = Safe, 2 = Danger
      },
      received_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Location',
      tableName: 'locations',
      timestamps: false, // We use our custom timestamp column
    }
  );

  return Location;
};
