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
    await queryInterface.dropTable('InvitedUsers');
  },

  async down(queryInterface, Sequelize) {
    // Rollback: Remove added columns from Users table
    await queryInterface.removeColumn('Users', 'adminId');
    await queryInterface.removeColumn('Users', 'parentId');
    await queryInterface.removeColumn('Users', 'driverId');

    // Recreate the InvitedUsers table (if needed)
    await queryInterface.createTable('InvitedUsers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      birthDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      trackerDeviceId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
};
