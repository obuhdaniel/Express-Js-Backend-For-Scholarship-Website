const express = require('express');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Info = require('../models/Info');
const InstitutionalDetails = require('../models/InstitutionalDetails');
const BankDetails = require('../models/BankDetails');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const auth = require('../middlewares/auth');

const router = express.Router();

// Utility function to get user details
const getUserDetails = async (userId) => {
  return Promise.all([
    User.findByPk(userId),
    Payment.findOne({ where: { userId } }),
    Info.findOne({ where: { userId } }),
    InstitutionalDetails.findOne({ where: { userId } }),
    BankDetails.findOne({ where: { userId } })
  ]);
};

// Check if all details are filled
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.sub; // Use optional chaining for safety
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [user, payment, info, institutionalDetails, bankDetails] = await getUserDetails(userId);

    const missingModels = [];

    if (!user) {
      missingModels.push('User');
    }
    if (!payment) {
      missingModels.push('Payment');
    }
    if (!info) {
      missingModels.push('Info');
    }
    if (!institutionalDetails) {
      missingModels.push('InstitutionalDetails');
    }
    if (!bankDetails) {
      missingModels.push('BankDetails');
    }

    if (missingModels.length > 0) {
      return res.status(400).json({ message: `Missing models: ${missingModels.join(', ')}` });
    }
    const allDetails = {
      user,
      payment,
      info,
      institutionalDetails,
      bankDetails
    };

    res.json(allDetails);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Server error');
  }
});

// Generate PDF
router.get('/generate-pdf', auth, async (req, res) => {
  try {
    const userId = req.user?.sub; // Use optional chaining for safety
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [user, payment, info, institutionalDetails, bankDetails] = await getUserDetails(userId);

    if (!user || !payment || !info || !institutionalDetails || !bankDetails) {
      return res.status(400).json({ message: 'All user details are not completed' });
    }

    const doc = new PDFDocument();
    const pdfPath = path.resolve(__dirname, `../../pdfs/acknowledgement-${userId}.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(20).text('Acknowledgement Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Full Name: ${user.firstname} ${user.surname}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Payment Amount: ${payment.amount}`);
    doc.text(`Payment Status: ${payment.status}`);
    // Add more fields as needed

    doc.end();

    doc.on('finish', () => {
      res.download(pdfPath, `acknowledgement-${userId}.pdf`);
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
