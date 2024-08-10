const express = require('express');
const InstitutionalDetails = require('../models/InstitutionalDetails');
const router = express.Router();
const auth = require('../middlewares/auth');

// Get Institutional Details
router.get('/', auth,  async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const details = await InstitutionalDetails.findOne({ where: { userId } });
    if (!details) {
      return res.status(404).json({ message: 'Institutional details not found' });
    }

    res.json(details);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Create or Update Institutional Details
router.post('/', auth, async (req, res) => {

  const userId = req.user.sub;
  const {
    institutionName,
    faculty,
    department,
    level,
    matricNo,
    degreeType,
    yearOfAdmission,
    expectedGradYear,
    currentSemester,
    cgpa,
    jambRegNo
  } = req.body;

  try {
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let details = await InstitutionalDetails.findOne({ where: { userId } });

    if (details) {
      // Update existing details
      details.institutionName = institutionName;
      details.faculty = faculty;
      details.department = department;
      details.level = level;
      details.matricNo = matricNo;
      details.degreeType = degreeType;
      details.yearOfAdmission = yearOfAdmission;
      details.expectedGradYear = expectedGradYear;
      details.currentSemester = currentSemester;
      details.cgpa = cgpa;
      details.jambRegNo = jambRegNo;
      await details.save();
    } else {
      // Create new details
      details = await InstitutionalDetails.create({
        institutionName,
        faculty,
        department,
        level,
        matricNo,
        degreeType,
        yearOfAdmission,
        expectedGradYear,
        currentSemester,
        cgpa,
        jambRegNo,
        userId
      });
    }

    res.status(201).json({ message: 'Institutional details saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
