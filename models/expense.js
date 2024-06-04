'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      // define association here
      
      Expense.belongsTo(models.User, { 
        foreignKey: 'paidByUserId', 
        as: 'payer' 
      });

      Expense.belongsTo(models.Group, { 
        foreignKey: 'groupId', 
        as: 'group' 
      });
    }
  }
  Expense.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0.01,
      }
    },
    currency: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    paidByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Group',
        key: 'id'
      }
    },
    picture_link: { 
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Expense',
    tableName: 'Expenses',
    timestamps: false,
  });
  return Expense;
};
