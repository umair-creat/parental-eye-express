'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Geofence extends Model {
    static associate(models) {
      // A Geofence belongs to a Device
      Geofence.belongsTo(models.Device, {
        foreignKey: 'device_id',
        as: 'device',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Geofence.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('area', 'route'),
        allowNull: false,
        defaultValue: 'area',
      },
      area: {
        type: DataTypes.GEOMETRY('POLYGON', 4326),
        allowNull: true,
      },
      path: {
        type: DataTypes.GEOMETRY('LINESTRING', 4326),
        allowNull: true,
      },
      buffer: {
        type: DataTypes.GEOMETRY('POLYGON', 4326),
        allowNull: true,
      },
      device_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Geofence',
      tableName: 'geofences',
      timestamps: false,
    }
  );

  return Geofence;
};
