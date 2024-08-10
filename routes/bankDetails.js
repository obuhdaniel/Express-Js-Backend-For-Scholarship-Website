const express = require('express');
const BankDetails = require('../models/BankDetails');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middlewares/auth')

// Get Bank Details
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const details = await BankDetails.findOne({ where: { userId } });
    if (!details) {
      return res.status(404).json({ message: 'Bank details not found' });
    }

    res.json({
      bankName: details.bankName,
      accountName: `${user.firstname} ${user.surname}`, // Fetched from user's full name
      accountNumber: details.accountNumber
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Create or Update Bank Details
router.post('/', auth, async (req, res) => {
  const {
    bankName,
    accountNumber
  } = req.body;

  try {
    const userId = req.user.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let details = await BankDetails.findOne({ where: { userId } });

    const accountName = `${user.firstname} ${user.surname}`;

    if (details) {
      // Update existing details
      details.bankName = bankName;
      details.accountName = accountName; // Account name fetched from user's full name
      details.accountNumber = accountNumber;
      await details.save();
    } else {
      // Create new details
      details = await BankDetails.create({
        bankName,
        accountName, // Account name fetched from user's full name
        accountNumber,
        userId
      });
    }

    res.status(201).json({ message: 'Bank details saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
