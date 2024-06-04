'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    // Define association
    static associate(models) {

      // Reverse association to User as the creator
      Group.belongsTo(models.User, { 
        foreignKey: 'createdByUserId', 
        as: 'creator' 
      });

      Group.hasMany(models.GroupMember, { 
        foreignKey: 'groupId', 
        as: 'members' 
      });

      //Group can have multiple expenses
      Group.hasMany(models.Expense, {  
        foreignKey: 'groupId',  
        as: 'expenses',
        onDelete: 'CASCADE'
      });

      //Groups Transactions
      Group.hasMany(models.Transaction, {
        foreignKey: 'groupId',
        as: 'transactions'
      });

      //Group Balances
      Group.hasMany(models.Balance, { 
        foreignKey: 'groupId', 
        as: 'balances' 
      });
      
    }
  }
  Group.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  }, {
    sequelize,
    modelName: 'Group',
    tableName: 'Groups',
    timestamps: false
  });

  return Group;
};