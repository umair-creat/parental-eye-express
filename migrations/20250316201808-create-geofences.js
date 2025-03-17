'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    

    // Create geofences table
    await queryInterface.createTable("Geofences", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('area', 'route', 'circle'),
        allowNull: false,
        defaultValue: 'area',
      },
      area: {
        type: Sequelize.GEOMETRY('POLYGON', 4326),
        allowNull: true,
      },
      path: {
        type: Sequelize.GEOMETRY('LINESTRING', 4326),
        allowNull: true,
      },
      center: {
        type: Sequelize.GEOMETRY('POINT', 4326),
        allowNull: true,
      },
      radius: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
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

    // Create geofence_devices table
    await queryInterface.createTable("GeofenceDevices", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      geofence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Geofences",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Devices",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    // Create spatial indexes for fast geolocation queries
// Create spatial indexes for fast geolocation queries
await queryInterface.sequelize.query(
  'CREATE INDEX IF NOT EXISTS geofences_area_gix ON "Geofences" USING GIST (area)'
);
await queryInterface.sequelize.query(
  'CREATE INDEX IF NOT EXISTS geofences_path_gix ON "Geofences" USING GIST (path)'
);
await queryInterface.sequelize.query(
  'CREATE INDEX IF NOT EXISTS geofences_center_gix ON "Geofences" USING GIST (center)'
);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables
    await queryInterface.dropTable("GeofenceDevices");
    await queryInterface.dropTable("Geofences");

    // Drop ENUM types (if no other tables use them)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "public"."enum_geofences_type" CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "public"."enum_geofences_status" CASCADE;');
  },
};
