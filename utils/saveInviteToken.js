const { GroupInvite } = require('../models');

const saveInviteToken = async (token, groupId, expiresAt) => {
    try {
        const invite = await GroupInvite.create({
            token,
            groupId,
            expiresAt,
        });
        return invite;
    } catch (error) {
        console.error('Error saving invite token:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

module.exports = saveInviteToken;