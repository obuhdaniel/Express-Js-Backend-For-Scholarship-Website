const express = require('express');
const User = require('../models/User');
const Info = require('../models/Info');
const Payment = require('../models/Payment');
const router = express.Router();

// Get User Info
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId, {
      include: [
        { model: Info },
        { model: Payment }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const response = {
      applicationNumber: user.Payment.applicationNumber,
      surname: user.surname,
      firstname: user.firstname,
      info: user.Info
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Create or Update User Info
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const {
    middleName,
    dateOfBirth,
    phoneNumber,
    address,
    nin,
    passportPhoto,
    stateOfOrigin,
    lgaOfOrigin
  } = req.body;

  try {
    let info = await Info.findOne({ where: { userId } });

    if (info) {
      // Update existing info
      info.middleName = middleName;
      info.dateOfBirth = dateOfBirth;
      info.phoneNumber = phoneNumber;
      info.address = address;
      info.nin = nin;
      info.passportPhoto = passportPhoto;
      info.stateOfOrigin = stateOfOrigin;
      info.lgaOfOrigin = lgaOfOrigin;
      await info.save();
    } else {
      // Create new info
      info = await Info.create({
        middleName,
        dateOfBirth,
        phoneNumber,
        address,
        nin,
        passportPhoto,
        stateOfOrigin,
        lgaOfOrigin,
        userId
      });
    }

    res.status(201).json({ message: 'User info saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
