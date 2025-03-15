'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the foreign key constraint on Devices.userId if it exists
    await queryInterface.sequelize.query(`
      ALTER TABLE "Devices" DROP CONSTRAINT IF EXISTS "Devices_userId_fkey";
    `);

    // Change the userId column to reference Users instead of InvitedUsers
    await queryInterface.changeColumn('Devices', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // new reference table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the foreign key constraint if it exists
    await queryInterface.sequelize.query(`
      ALTER TABLE "Devices" DROP CONSTRAINT IF EXISTS "Devices_userId_fkey";
    `);

    // Revert the userId column to reference InvitedUsers
    await queryInterface.changeColumn('Devices', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'InvitedUsers', // previous reference table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
