// migrations/[timestamp]-create-invited-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('InvitedUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users', 
          key: 'id',
        },
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true, 
      },
      tracker_device_id: {
        type: Sequelize.STRING,
        allowNull: true, 
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true, 
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, 
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, 
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('InvitedUsers');
  }
};
