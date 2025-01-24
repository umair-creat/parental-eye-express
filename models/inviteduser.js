// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class InvitedUser extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   InvitedUser.init({
//     type: DataTypes.INTEGER,
//     fullName: DataTypes.STRING,
//     parentId: DataTypes.INTEGER,
//     birthDate: DataTypes.DATE,
//     trackerDeviceId: DataTypes.STRING,
//     phoneNumber: DataTypes.STRING,
//     status: DataTypes.INTEGER,
//     createdAt: DataTypes.DATE,
//     updatedAt: DataTypes.DATE
//   }, {
//     sequelize,
//     modelName: 'InvitedUser',
//   });
//   return InvitedUser;
// };

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvitedUser extends Model {
    static associate(models) {
      InvitedUser.belongsTo(models.User, {
        foreignKey: 'parentId',
        as: 'parent',
      });
    }
  }

  InvitedUser.init({
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trackerDeviceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
createdAt: DataTypes.DATE,
updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'InvitedUser',
    tableName: 'InvitedUsers',
    timestamps: true,
  });

  return InvitedUser;
};
