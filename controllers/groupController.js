//ENV
require('dotenv').config();

//For invite token encrype
const crypto = require('crypto');


//Utils
const saveInviteToken = require('../utils/saveInviteToken');
const { Op } = require('sequelize');

//Required packages
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
 

//DB
const { sequelize } = require('../models');

//Required models
const {User,Group,GroupMember,Balance,Expense,Transaction,GroupInvite} = require('../models');

//Get group information
exports.getGroupsInfo = async (req,res) => {

    try{
        //Get the user id from token
        const userId = req.user.id;

        // Find all groups where the user is a member
        const groups = await Group.findAll({
            include: [{
                model: GroupMember,
                as: 'members',
                where: { userId: userId },
                attributes: []
            }],
            attributes: [
                'id', 
                'name'
            ],
            group: ['Group.id'],
            raw: true
        });

         // If no groups found, return a message
         if (!groups.length) {
            return res.status(404).json({ message: 'No groups found for this user.' });
        }

        for (let group of groups) {
            const count = await GroupMember.count({
                where: { groupId: group.id }
            });
            group.numberOfMembers = count;
        }

        //Return JSON
        res.json(groups);
    }catch (error)
    {
        console.log(error);
        res.status(500).json({ message: 'An error occurred while fetching groups information' });
    }

};


// Get specific group information
exports.getGroupInfo = async (req, res) => {
    // Get the info from request
    const { groupId } = req.params; 
    const userId = req.user.id; 

    try {
        // Find the group by id and check if the user is a member
        const group = await Group.findByPk(groupId, {
            include: [{
                model: GroupMember,
                as: 'members',
                required: false, // This specifies that the join should not be inner, allowing groups without members to be included
                include: [{
                    model: User,
                    as: 'user',
                    required: false,
                    attributes: ['first_name', 'profile_picture']
                }]
            }],
            attributes: ['id', 'name', 'profile_image', 'description', 'currency']
        });

        // Check if group exists
        if (!group) {
            return res.status(404).json({ message: 'Group not found or you are not a member of this group.' });
        }
        console.log(JSON.stringify(group, null, 2));

        // Calculate the number of members in the group
        const numberOfMembers = await GroupMember.count({
            where: { groupId: groupId }
        });

        // Corrected part: Ensure group.members is defined and accessible before mapping over it
        const members = group.members ? group.members.map(member => {
            return {
                first_name: member.user.first_name, // Corrected from members.user to member.user
                profile_picture: member.user.profile_picture // Corrected from members.user to member.user
            };
        }) : [];

        // Return JSON including the number of members
        res.json({
            id: group.id,
            name: group.name,
            description: group.description,
            profile_image: group.profile_image,
            currency: group.currency,
            numberOfMembers: numberOfMembers,
            members
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching group information' });
    }
};



//Get group overview
exports.getGroupOverview = async (req, res) => {
    const { groupId } = req.params;

    try {
        // Fetch balance information
        const balances = await Balance.findAll({
            where: { groupId: groupId },
            include: [{
                model: User,
                as: "user",
                attributes: ['first_name', 'profile_picture'],
            }],
            attributes: ['balance'],
        });

        const memberBalances = balances.map(balance => ({
            memberId: balance.user.id,
            name: `${balance.user.first_name}`,
            profilePicture: balance.user.profile_picture,
            balance: balance.balance
        }));

        // Fetch transaction information
        const transactions = await Transaction.findAll({
            where: { groupId: groupId },
            include: [
                {
                    model: User,
                    as: 'payer',
                    attributes: ['id', 'first_name', 'last_name', 'profile_picture']
                },
                {
                    model: User,
                    as: 'payee',
                    attributes: ['id', 'first_name', 'last_name', 'profile_picture'],
                    required: false
                }
            ],
            order: [['date', 'DESC']],
        });

        // Construct the response
        const groupOverview = {
            memberBalances: memberBalances,
            transactions: transactions
        };

        if (!memberBalances.length && !transactions.length) {
            return res.status(404).json({ message: 'No members, balance information, or transactions found for this group.' });
        }

        // Return the combined information
        return res.json(groupOverview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching group overview information.' });
    }
};



//Get group balances
exports.getBalance = async (req, res) => {

    try {
        //Get the group id from the request
        const groupId = req.params.groupId;

        //Fetch the balance info for each group member
        const balances = await Balance.findAll({
            where: { groupId: groupId },
            include: [{
                model: User,
                as: "user",
                attributes: ['first_name','profile_picture'],
            }],
            attributes: ['balance'],
        });

        //Manipulate info => member details and balance
        const memberBalances = balances.map(balance => ({
            memberId: balance.user.id,
            name: `${balance.user.first_name} ${balance.user.last_name}`,
            profilePicture: balance.user.profile_picture,
            balance: balance.balance
        }));

        if (!memberBalances.length) {
            return res.status(404).json({ message: 'No members or balance information found for this group.' });
        }

        //Retun the info
        return res.json(memberBalances);
    } catch (error){

        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching balance information' });
    }

};

//Add Expanse
exports.addExpense = async (req, res) => {

    //Get info from request
    const { groupId } = req.params;
    const { amount, description, date, currency } = req.body;
    const userId = req.user.id;

    //Convert the amount to float
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        return res.status(400).json({ message: "Invalid amount provided." });
    }

    // Start a transaction
    const t = await sequelize.transaction();

    try {
        // Check if is member
        const isMember = await GroupMember.findOne({ where: { groupId, userId } });

        if (!isMember) {
            return res.status(403).json({ message: "User is not a member of the group." });
        }
        // Create the expense
        const expense = await Expense.create({
            description,
            amount: numericAmount,
            currency: currency, 
            paidByUserId: userId,
            groupId,
            date: date || new Date(), 
        }, { transaction: t });
    
        //Get all members
        const members = await GroupMember.findAll({ where: { groupId } });

        // Update or create balances for all group members
        await Promise.all(members.map(async (member) => {
            const [balance, created] = await Balance.findOrCreate({
                where: { userId: member.userId, groupId },
                // Default balance if not existing
                defaults: {
                    //Prima data,, ii face cu minus
                    balance: -numericAmount, 
                    userId: member.userId,
                    groupId
                },
                transaction: t
            });

            //Update it if exists
            const newBalance = created ? balance.balance : sequelize.literal(`balance - ${numericAmount / members.length}`);
            await Balance.update({ balance: newBalance }, {
                where: { userId: member.userId, groupId },
                transaction: t
            });
        }));

        // Create a transaction record for the expense
        await Transaction.create({
            description: `Expense: ${description}`,
            // Negative because it's an expense
            amount: -numericAmount, 
            currency: currency,
            paidByUserId: userId,
            groupId,
            date: date || new Date(),
        }, { transaction: t });

        // Commit the transaction
        await t.commit();

        res.status(201).json({ message: "Da ba banii.", expense });
    } catch (error) {

        // Rollback the transaction in case of error
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: "An error occurred while adding the expense." });
    }
};


//Add Income
exports.addIncome = async (req, res) => {

    //Get info from request
    const { groupId } = req.params;
    const { amount, description, date, currency } = req.body;
    const userId = req.user.id;

    //Convert the amount to float
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        return res.status(400).json({ message: "Invalid amount provided." });
    }

    // Start a transaction
    const t = await sequelize.transaction();

    try {

        // Check if is member
        const isMember = await GroupMember.findOne({ where: { groupId, userId } });

        if (!isMember) {
            return res.status(403).json({ message: "User is not a member of the group." });
        }

        // Create a transaction record for the income
        await Transaction.create({
            description: `Income: ${description}`,
            // Positive because it's an income
            amount: numericAmount, 
            currency: currency,
            paidByUserId: userId,
            paidToUserId: null,
            groupId,
            date: date || new Date(),
        }, { transaction: t });

        //Get group members
        const members = await GroupMember.findAll({ where: { groupId } });
        // Update balances for all group members
        await Promise.all(members.map(async (member) => {
            await Balance.update({
                balance: sequelize.literal(`balance + ${numericAmount / members.length}`) 
            }, {
                where: { userId: member.userId, groupId },
                transaction: t
            });
        }));

         // Commit the transaction
         await t.commit();
    } catch (error) {
         // Rollback the transaction in case of error
         if (t.finished !== 'commit') {
            await t.rollback();
        }
         console.error(error);
         res.status(500).json({ message: "An error occurred while adding the expense." });
    }

    if (t.finished === 'commit') {
        // If commit was successful
        res.json({ message: "Ia ba banii.", amount: numericAmount });
    } else {
        // If there was an error and rollback occurred
        res.status(500).json({ message: "An error occurred while adding the income." });
    }
};

//Get tansactions within a group
// Get all transactions for a specific group
exports.getGroupTransactions = async (req, res) => {
    const { groupId } = req.params;

    try {
        const transactions = await Transaction.findAll({
            where: { groupId: groupId },
            include: [
                {
                    model: User,
                    as: 'payer',
                    attributes: ['id', 'first_name', 'last_name', 'profile_picture']
                },
                {
                    model: User,
                    as: 'payee',
                    attributes: ['id', 'first_name', 'last_name', 'profile_picture'],
                    required: false // This ensures that transactions without a payee are still included
                }
            ],
            order: [['date', 'DESC']], // Assuming you want to sort transactions by date
        });

        if (!transactions) {
            return res.status(404).json({ message: 'No transactions found for this group.' });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching transactions for the group.' });
    }
};



//Create GroupInvite Link
exports.createInviteLink = async (req, res) => {
    const { groupId } = req.params; 

    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');

    // Set an expiration time 
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    try {
        // Save the token with its associated group ID and expiration date in the database
        await saveInviteToken(token, groupId, expiresAt);

        // Construct the invite link. Adjust the URL path as needed for your application's route structure
        //const inviteLink = `${req.protocol}://${req.get('host')}/groups/join?token=${token}`;

        // Return the link
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the invite link.' });
    }
};


//Join group via link
exports.joinGroupUsingToken = async (req, res) => {
    const { token } = req.body; // Assuming the token is sent in the request body
    const userId = req.user.id; // Assuming you have middleware to authenticate and set `req.user`

    try {
        // Validate the invite token and get associated groupId
        const invite = await GroupInvite.findOne({
            where: {
                token: token,
                expiresAt: {
                    [Op.gt]: new Date() // Check if token has not expired
                }
            }
        });

        if (!invite) {
            return res.status(404).json({ message: 'Invalid or expired invite token.' });
        }

        // Optional: Check if the user is already a member of the group
        const isMember = await GroupMember.findOne({
            where: { userId: userId, groupId: invite.groupId }
        });

        if (isMember) {
            return res.status(400).json({ message: 'You are already a member of this group.' });
        }

        // Create a new group member entry
        const newMember = await GroupMember.create({
            userId: userId,
            groupId: invite.groupId
        });

        // Optional: Invalidate the invite token after successful use
        // await invite.destroy();

        res.json({ message: 'Successfully joined the group.',  groupId: newMember.groupId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while joining the group.' });
    }
};
exports.uploadImage = async (req, res) => {
    try {
        console.log(req.file)
        const image = req?.file
        //find group with group Id and update group
        
    } catch (error) {
        
    }
    
  }