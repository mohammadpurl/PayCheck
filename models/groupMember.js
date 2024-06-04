'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    // Define association here
    static associate(models) {

      GroupMember.belongsTo(models.User, {
         foreignKey: 'userId', 
         as: 'user' 
      });

      GroupMember.belongsTo(models.Group, { 
        foreignKey: 'groupId', 
        as: 'group' 
      });
    }
  }
  GroupMember.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    }
  }, {
    sequelize,
    modelName: 'GroupMember',
    tableName: 'GroupMembers',
    timestamps: false
  });

  return GroupMember;
};
