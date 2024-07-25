// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Payment = require('../models/Payment');



// Function to generate a unique application number
let applicationNumberCounter = 1000;
const generateApplicationNumber = () => {
  return `DALGO/2024/${applicationNumberCounter++}`;
};

router.get('/pay', async(req, res) => {
    res.send('Use user id and ammount to pay')
});

// Payment Route
router.post('/pay', async (req, res) => {
  const { userId, amount } = req.body;

  try {
    // Fetch user information
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique application number
    const applicationNumber = generateApplicationNumber();

    // Create a new payment record
    const payment = await Payment.create({
      applicationNumber,
      userId,
      amount,
      status: 'pending'
    });

    // Prepare data for payment gateway
    const paymentData = {
      applicationNumber: payment.applicationNumber,
      fullName: `${user.surname} ${user.firstname}`,
      amount: payment.amount,
      status: payment.status
    };

    // TODO: Integrate with payment gateway here

    res.status(201).json({
      message: 'Payment initiated successfully',
      paymentData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Login route
router.get('/register', (req, res) => {
  res.send('You are in the registration process')
});
// User Registration
router.post('/register', async (req, res) => {
  const { surname, firstname, email, password } = req.body;

  if (!surname || !firstname || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields: surname, firstname, email, and password' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    user = await User.create({ surname, firstname, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = { userId: user.id };
    const token = jwt.sign(payload, 'secret', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
module.exports = router;
