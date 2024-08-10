const express = require('express');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Info = require('../models/Info');
const InstitutionalDetails = require('../models/InstitutionalDetails');
const BankDetails = require('../models/BankDetails');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const auth = require('../middlewares/auth');

// Check if all details are filled
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    const payment = await Payment.findOne({ where: { userId } });
    const info = await Info.findOne({ where: { userId } });
    const institutionalDetails = await InstitutionalDetails.findOne({ where: { userId } });
    const bankDetails = await BankDetails.findOne({ where: { userId } });

    // if (!user || !payment || !info || !institutionalDetails || !bankDetails) {
    //   return res.status(400).json({ message: 'All user details are not completed' });
    // }

    const allDetails = {
      user,
      payment,
      info,
      institutionalDetails,
      bankDetails
    };

    res.json(allDetails);
    res.json({allDetails})
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Generate PDF
router.get('/generate-pdf', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    const payment = await Payment.findOne({ where: { userId } });
    const info = await Info.findOne({ where: { userId } });
    const institutionalDetails = await InstitutionalDetails.findOne({ where: { userId } });
    const bankDetails = await BankDetails.findOne({ where: { userId } });

    // if (!user || !payment || !info || !institutionalDetails || !bankDetails) {
    //   return res.status(400).json({ message: 'All user details are not completed' });
    // }

    const doc = new PDFDocument();
    const pdfPath = path.join(__dirname, `../../pdfs/acknowledgement-${userId}.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(20).text('Acknowledgement Receipt', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Full Name: ${user.firstname} ${user.surname}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Payment Amount: ${payment.amount}`);
    doc.text(`Payment Status: ${payment.status}`);
    doc.text(`Institution: ${institutionalDetails.institutionName}`);
    doc.text(`Faculty: ${institutionalDetails.faculty}`);
    doc.text(`Department: ${institutionalDetails.department}`);
    doc.text(`Level: ${institutionalDetails.level}`);
    doc.text(`Matric Number: ${institutionalDetails.matricNo}`);
    doc.text(`Degree Type: ${institutionalDetails.degreeType}`);
    doc.text(`Year of Admission: ${institutionalDetails.yearOfAdmission}`);
    doc.text(`Expected Graduation Year: ${institutionalDetails.expectedGradYear}`);
    doc.text(`Current Semester: ${institutionalDetails.currentSemester}`);
    doc.text(`CGPA: ${institutionalDetails.cgpa}`);
    doc.text(`JAMB Registration Number: ${institutionalDetails.jambRegNo}`);
    doc.text(`Bank Name: ${bankDetails.bankName}`);
    doc.text(`Account Name: ${bankDetails.accountName}`);
    doc.text(`Account Number: ${bankDetails.accountNumber}`);

    doc.end();

    doc.on('finish', function() {
      res.download(pdfPath, `acknowledgement-${userId}.pdf`);
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
