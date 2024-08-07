const express = require('express');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig'); // Adjust path if necessary
const User = require('../models/User');
const Info = require('../models/Info');
const Payment = require('../models/Payment');
const router = express.Router();
const auth = require('../middlewares/auth');

const multer = require('multer');

const upload = multer({
  dest: 'uploads/', // Directory to save the uploaded files
  limits: { fileSize: 0.5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload an image.'));
    }
    cb(null, true);
  }
});

if (!fs.existsSync('uploads')){
  fs.mkdirSync('uploads');


}
// Create or Update User Info
router.post('/', upload.single('passportPhoto'), auth, async (req, res) => {
  const userId = req.user.sub; 
  const {
    middleName,
    dateOfBirth,
    phoneNumber,
    address,
    nin,
    stateOfOrigin,
    lgaOfOrigin
  } = req.body;

  try {
    let passportPhotoUrl = '';

    if (req.file) {
      // File uploaded successfully
      passportPhotoUrl = `/uploads/${req.file.filename}`;
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
