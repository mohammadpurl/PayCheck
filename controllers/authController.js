//ENV
require('dotenv').config();

//Required  packages
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');



//Required models
const { User,VerificationTokens } = require('../models');
const { PasswordResetToken } = require('../models');

// Register logic
exports.register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Get info from request
    const { first_name, last_name, email, password } = req.body;

    // Check if user already existss
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create user
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword
    });

    // Generate JWT token for the new user
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // User object to return, excluding the password
    const userToReturn = { ...newUser.toJSON(), password: undefined };

    // Return the user info and JWT token
    res.status(201).json({ user: userToReturn, token });
  } catch (error) {
    res.status(400).send(error);
  }
};



// Login logic
exports.login = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    
    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ error: 'No account associated with this email address' });
    }
    
    // Check if the provided password matches the user's password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Update the user's last login date
    await user.update({ last_login: new Date() });
    
    // Generate a JWT token for the user
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Respond with a success message and the token
    res.json({ message: 'Login successful', token });
   
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'An error occurred while trying to log in' });
  }
};


//Forgot Password logic
exports.forgotPassword = async (req, res) => {
  // Check for validation errors from the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Consider not revealing whether the email exists for privacy/security
    if (!user) {
      return res.status(200).json({ message: 'If an account with that email exists, we have sent a password reset email.' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Token expiration time, e.g., 1 hour from now
    const expireTime = new Date(Date.now() + 3600000);

    // Create a password reset token entry
    await VerifyTokens.create({
      userId: user.id,
      token: resetToken,
      type: 'password_reset',
      expires_at: expireTime,
    });

    // Setup email transporter using nodemailer
    const transporter = nodemailer.createTransport({
      host: 'app.andreeaghelmegeanu.com', 
      port: 465,
      secure: true, 
      auth: {
        user: 'paycheck@app.andreeaghelmegeanu.com', 
        pass: 'Anaaremeremulte!1', 
      },
    });

    // Define the email's contents
    const resetUrl = `https://app.andreeaghelmegeanu.com/reset-password/${resetToken}`; 
    const mailOptions = {
      from: '"PayCheck" <reset@paycheck.com>', 
      to: email, // recipient
      subject: 'Password Reset Request', // Subject line
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Send Mail error: ', error);
        return res.status(500).json({ error: 'Error sending email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'Email sent successfully: ' + info.response });
      }
    });
  } catch (error) {
    console.error('Forgot Password error: ', error);
    res.status(500).send({ error: 'An error occurred while processing your request.' });
  }
};


// Change Password Logic 
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  try {
      // Find the token in the database
      const passwordResetToken = await PasswordResetToken.findOne({ where: { token } });
      if (!passwordResetToken || passwordResetToken.expires < Date.now()) {
          return res.status(400).json({ error: 'Token is invalid or has expired.' });
      }

      // Find the user associated with the reset token
      const user = await User.findByPk(passwordResetToken.userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found.' });
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 8);

      // Update the user's password
      await user.update({ password: hashedNewPassword });

      // Optionally, delete the reset token from the database to prevent reuse
      await PasswordResetToken.destroy({ where: { id: passwordResetToken.id } });

      res.json({ message: 'Password has been updated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error:'An error occurred while trying to reset the password.' });
    }
};


//Next Forget Passw (?? Mail localhost)
//Google auth ??

//TEST PENTRU MARCI //
