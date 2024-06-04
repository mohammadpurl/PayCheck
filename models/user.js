// model for user
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    // Associations
    static associate(models) {

      //VerificationToken
      User.hasMany(models.VerificationToken, {
        foreignKey: 'userId',
        as: 'verificationTokens',
        onDelete: 'CASCADE',
      });

      //GroupMember
      User.hasMany(models.GroupMember, {
        foreignKey: 'userId',
        as: 'memberships',
        onDelete: 'CASCADE',
      });

       // Direct to Groups as the creator
       User.hasMany(models.Group, {
        foreignKey: 'createdByUserId',
        as: 'createdGroups',
        onDelete: 'CASCADE',
      });

      //User can create multiple expanses
      User.hasMany(models.Expense,{
        foreignKey: 'paidByUserId',
        as: 'expenses',
        onDelete: 'CASCADE',
      });

      //User pays money back
      User.hasMany(models.Transaction, {
        foreignKey: "paidByUserId",
        as: 'paymentsMade'
      });

      //User receives money
      User.hasMany(models.Transaction, {
        foreignKey: "paidToUserId",
        as: 'paymentsReceived',
        allowNull: true
      });

      //Keep track of balances
      User.hasMany(models.Balance, { 
        foreignKey: 'userId', 
        as: 'balances' 
      });

    }
  };
  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
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
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: false, 
  });

  return User;
};
