const cloudinary = require('cloudinary').v2;
require('dotenv').config()

// Replace with your Cloudinary credentials
cloudinary.config({
  cloud_name: 'dzxbpzkhs',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
