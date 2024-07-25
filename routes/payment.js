const express = require('express');
const User = require('../models/User');

const router = express.Router();

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

module.exports = router;
