const { validationResult } = require('express-validator');

//Santier and Debug
const fs = require('fs');
const path = require('path');

// Function to append errors to log.txt
const logErrorToFile = (error) => {
  const logMessage = `${new Date().toISOString()} - Error: ${error.message}\n`;
  const logFilePath = path.join(__dirname, '..', 'logs', 'log.txt'); // Adjust path as needed

  // Append the error message to the log file, creating the file if it doesn't exist
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error('Logging Error:', err);
  });
};



// Requrie Models
const { User, Group, GroupMember } = require('../models');
const { sequelize } = require('../models');


//Get user info
exports.getUserInfo = async (req, res) => {
  try {
    //get user id from token
    const userId = req.user.id;

    //Build user info, without pass
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get User Info Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching user information' });
  }
};

//Create group
exports.createGroup = async (req, res) => {

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
 
  // Start a new transaction
  const transaction = await sequelize.transaction(); 
  try {
    const { name, description, currency } = req.body;

    // User ID from authentication middleware
    const createdByUserId = req.user.id; 

    // Create new group with transaction
    const group = await Group.create({
      name,
      description,
      currency,
      createdByUserId,
    }, { transaction });

    // Automatically add creator as a member of the groups
    await GroupMember.create({
      userId: createdByUserId,
      groupId: group.id
    }, { transaction });

    // Commit the transaction
    await transaction.commit(); 

    //Return success
    res.status(201).json({ success: true });

  } catch (error) {
    // Roll back the transaction in case of error
    await transaction.rollback(); 
    console.error('Create Group Error:', error);
    //Log the errors
    logErrorToFile(error);
    res.status(500).json({ message: 'An error occurred while creating the group' });
  }
};



//Add expanse 


