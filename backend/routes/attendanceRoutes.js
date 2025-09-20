const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Get all attendance records
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.all('SELECT * FROM attendance');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Add attendance record
router.post('/', async (req, res, next) => {
  try {
    const { studentId, date, status } = req.body;
    if (!studentId || !date || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const stmt = await db.run(
      'INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)',
      [studentId, date, status]
    );
    res.status(201).json({ id: stmt.lastID });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
