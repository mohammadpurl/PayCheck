// Auth Routes
const express = require('express');
// Required Controller
const authController = require('../controllers/authController');
// Required Middleware
const authenticateToken = require('../middleware/authenticateToken');
// Import express-validator
const { body } = require('express-validator');

const router = express.Router();


//Register EndPoint
router.post("/register", [
  body('first_name').not().isEmpty().withMessage('First name is required'),
  body('last_name').not().isEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], authController.register);

//Login EndPoint
router.post('/login', [
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').not().isEmpty().withMessage('Password is required')
], authController.login);

// Forgot Password endpoint
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Must be a valid email address')
], authController.forgotPassword);

//Change password 
router.post('/reset-password', [
    body('token').not().isEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], authController.resetPassword);



// Adding a protected route for changing password
//router.post('/change-password', authenticateToken, authController.changePassword);

// Forget Password (To be implemented)
// Google Auth (To be implemented)

module.exports = router;
