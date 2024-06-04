'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Balance extends Model {
    static associate(models) {

      Balance.belongsTo(models.Group, { 
        foreignKey: 'groupId', 
        as: 'group' 
      });

      Balance.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });
    }
  }
  Balance.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    last_updated: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Balance',
    tableName: 'Balances',
    timestamps: false,
  });
  return Balance;
};
