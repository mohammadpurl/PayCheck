// routes/userRoutes.js
const express = require('express');

// Import express-validator
const { body } = require('express-validator');

//Required controllers functions
const { getUserInfo, createGroup } = require('../controllers/userController');

//JWT Middleware
const authenticateToken = require('../middleware/authenticateToken'); 


const router = express.Router();

// Route to get user information
router.get('/get-info', authenticateToken, getUserInfo);

//Route to create group
router.post('/create-group', authenticateToken, [
    body('name', 'Group Name is required').not().isEmpty(),
    body('description', 'Group Description is required').not().isEmpty(),
    body('currency', 'Group Currency is required').not().isEmpty()
], createGroup);




module.exports = router;
