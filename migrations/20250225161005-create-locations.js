'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("locations", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
      location: {
        type: Sequelize.GEOMETRY('POINT', 4326),
        allowNull: false,
      },
      location_status: {
        type: Sequelize.INTEGER, // 1 = Safe, 2 = Danger
        allowNull: false,
        defaultValue: 1,
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    // Create spatial index for fast geospatial queries
    await queryInterface.sequelize.query(
      'CREATE INDEX locations_gix ON "locations" USING GIST (location)'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("locations");
  },
};
