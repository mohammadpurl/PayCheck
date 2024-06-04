// models/GroupInvite.js

module.exports = (sequelize, DataTypes) => {
    const GroupInvite = sequelize.define('GroupInvite', {
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
      // Disable timestamps here
      timestamps: false,
    });

    return GroupInvite;
};