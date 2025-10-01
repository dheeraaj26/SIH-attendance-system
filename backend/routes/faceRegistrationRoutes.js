const express = require('express');
const router = express.Router();
const faceRegistrationService = require('../services/faceRegistrationService');

// Register a new face
router.post('/register', async (req, res, next) => {
  try {
    const { studentData, faceDescriptor } = req.body;

    if (!studentData || !faceDescriptor) {
      return res.status(400).json({
        error: 'Student data and face descriptor are required'
      });
    }

    // Validate student data
    if (!studentData.student_id || !studentData.name) {
      return res.status(400).json({
        error: 'Student ID and name are required'
      });
    }

    const result = await faceRegistrationService.registerFace(studentData, faceDescriptor);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get all registered faces
router.get('/registered-faces', async (req, res, next) => {
  try {
    const faces = await faceRegistrationService.getAllRegisteredFaces();
    res.json(faces);
  } catch (err) {
    next(err);
  }
});

// Compare face with registered faces
router.post('/compare', async (req, res, next) => {
  try {
    const { faceDescriptor } = req.body;

    if (!faceDescriptor) {
      return res.status(400).json({
        error: 'Face descriptor is required'
      });
    }

    const result = await faceRegistrationService.compareFace(faceDescriptor);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Mark attendance
router.post('/mark-attendance', async (req, res, next) => {
  try {
    const { studentId, confidence } = req.body;

    if (!studentId) {
      return res.status(400).json({
        error: 'Student ID is required'
      });
    }

    const result = await faceRegistrationService.markAttendance(studentId, confidence || 0.8);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get attendance records for a specific date
router.get('/attendance/:date', async (req, res, next) => {
  try {
    const { date } = req.params;
    const records = await faceRegistrationService.getAttendanceRecords(date);
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// Get today's attendance
router.get('/attendance', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await faceRegistrationService.getAttendanceRecords(today);
    res.json(records);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
