// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs');

// Login route
router.get('/register', (req, res) => {
  res.send('You are in the registration process');
});
router.post('/register', async (req, res) => {
  const { surname, firstname, email, password } = req.body;
  try {
    // Check if user already exists
    // let user = await User.findOne({ where: { email } });
    // if (user) {
    //   return res.status(400).json({ message: 'User already exists' });
    // }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    user = await User.create({ surname, firstname, email, password: hashedPassword });

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
