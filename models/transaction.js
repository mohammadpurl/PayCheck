'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      
      Transaction.belongsTo(models.User, { 
        foreignKey: 'paidByUserId', 
        as: 'payer' 
      });

      Transaction.belongsTo(models.User, { 
        foreignKey: 'paidToUserId', 
        as: 'payee', 
        allowNull: true 
      });


      Transaction.belongsTo(models.Group, { 
        foreignKey: 'groupId', 
        as: 'group' 
      });
    }
  }
  Transaction.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    paidByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paidToUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      allowNull: false,
      type: DataTypes.DATEONLY,
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
    modelName: 'Transaction',
    tableName: 'Transactions',
    timestamps: false,
  });
  return Transaction;
};
