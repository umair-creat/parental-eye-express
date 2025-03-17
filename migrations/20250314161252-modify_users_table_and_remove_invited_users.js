'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to Users table
    await queryInterface.addColumn('Users', 'adminId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('Users', 'parentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('Users', 'driverId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Remove the InvitedUsers table
  },

  async down(queryInterface, Sequelize) {
    // Rollback: Remove added columns from Users table
    await queryInterface.removeColumn('Users', 'adminId');
    await queryInterface.removeColumn('Users', 'parentId');
    await queryInterface.removeColumn('Users', 'driverId');

    // Recreate the InvitedUsers table (if needed)

  },
};
