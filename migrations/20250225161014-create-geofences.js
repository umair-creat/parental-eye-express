'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("geofences", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.ENUM('area', 'route'),
        allowNull: false,
        defaultValue: 'area',
      },
      // For static area geofences
      area: {
        type: Sequelize.GEOMETRY('POLYGON', 4326),
        allowNull: true,
      },
      // For route-based geofences
      path: {
        type: Sequelize.GEOMETRY('LINESTRING', 4326),
        allowNull: true,
      },
      // Buffer (safe corridor) around a route
      buffer: {
        type: Sequelize.GEOMETRY('POLYGON', 4326),
        allowNull: true,
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Devices',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    // Create spatial indexes
    await queryInterface.sequelize.query(
      'CREATE INDEX geofences_area_gix ON "geofences" USING GIST (area)'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX geofences_path_gix ON "geofences" USING GIST (path)'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("geofences");
  },
};
