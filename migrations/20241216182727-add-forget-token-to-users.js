'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding the forgetToken column to the Users table
    await queryInterface.addColumn('Users', 'forgetToken', {
      type: Sequelize.STRING,
      allowNull: true, // Optional column
      comment: 'Token used for password recovery',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'forgetToken');
  },
};
