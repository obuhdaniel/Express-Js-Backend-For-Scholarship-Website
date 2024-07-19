// routes/exam.js
const express = require('express');
const Exam = require('../models/exam');
const router = express.Router();

// Register for exam
router.post('/register', async (req, res) => {
  try {
    const { userId, examDate, examDetails } = req.body;
    const exam = await Exam.create({ userId, examDate, examDetails });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get exam details
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
