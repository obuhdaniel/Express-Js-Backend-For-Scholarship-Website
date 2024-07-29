const express = require('express');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig'); // Adjust path if necessary
const User = require('../models/User');
const Info = require('../models/Info');
const Payment = require('../models/Payment');
const router = express.Router();
const auth = require('../middlewares/auth');

// Get User Info
router.get('/', auth, async (req, res) => {
  const userId  = req.session.userId;
  const apkno = `DALGO/2024/${1000+ userId}`;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const response = {
      applicationNumber: apkno,
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
router.post('/', async (req, res) => {
  const userId  = req.session.userId;
  const {
    middleName,
    dateOfBirth,
    phoneNumber,
    address,
    nin,
    stateOfOrigin,
    lgaOfOrigin,
    passportPhotoBase64
  } = req.body;

  try {
    let passportPhotoUrl = 'https://res.cloudinary.com/dzxbpzkhs/image/upload/v1722258677/images_nhwvmg.png';

    if (passportPhotoBase64) {
      // Decode Base64 string and upload to Cloudinary
      const buffer = Buffer.from(passportPhotoBase64, 'base64');
      const result = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) {
          throw error;
        }
        passportPhotoUrl = result.secure_url;
      });

      // Create a readable stream from the buffer and upload to Cloudinary
      const stream = require('stream');
      const readableStream = new stream.PassThrough();
      readableStream.end(buffer);
      readableStream.pipe(result);
    }

    // Find or create the info record
    let info = await Info.findOne({ where: { userId } });

    if (info) {
      // Update existing info
      info.middleName = middleName;
      info.dateOfBirth = dateOfBirth;
      info.phoneNumber = phoneNumber;
      info.address = address;
      info.nin = nin;
      info.passportPhoto = passportPhotoUrl || info.passportPhoto; // Use new URL if available
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
        passportPhoto: passportPhotoUrl, // Set URL if available
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
