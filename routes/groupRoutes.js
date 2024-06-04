const express = require('express');

// Import express-validator
const { body } = require('express-validator');

//JWT Middleware
const authenticateToken = require('../middleware/authenticateToken'); 

const {upload} = require("../utils/multer");

//Required controllers functions
const {
    getGroupsInfo,
    getGroupInfo,
    getGroupOverview,
    getBalance,
    addExpense,
    addIncome,
    getGroupTransactions,
    createInviteLink,
    joinGroupUsingToken,
    uploadImage
  } = require('../controllers/groupController.js');

const router = express.Router();

// Route to get groups information
router.get('/get-groups', authenticateToken, getGroupsInfo);

// Route to get information for a specific group
router.get('/get-group/:groupId', authenticateToken, getGroupInfo);

//Route to get overview of a specific group
router.get('/get-group-overview/:groupId', authenticateToken, getGroupOverview);

// Route to get balance information for a group
router.get('/get-balance/:groupId', authenticateToken, getBalance);

// Route to add an expense to a group
router.post('/add-expense/:groupId',
  authenticateToken,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('currency').notEmpty().withMessage('Currency is required'),
  ],
  addExpense
);

// Route to add income to a group
router.post('/add-income/:groupId',
  authenticateToken,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('currency').notEmpty().withMessage('Currency is required'),
  ],
  addIncome
);

// Route to get all transactions for a specific group
router.get('/get-transactions/:groupId', authenticateToken, getGroupTransactions);

//Route for generating invite
router.post('/generate-invite/:groupId', 
authenticateToken, 
createInviteLink
);

// Upload Image for Group
router.post('/upload-image/:groupId', authenticateToken, upload.single("image"),uploadImage)

// Route for a user to join a group using an invite token
router.post('/join-group', authenticateToken, joinGroupUsingToken);


module.exports = router;