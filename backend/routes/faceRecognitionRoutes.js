const express = require('express');
const multer = require('multer');
const router = express.Router();
const databaseService = require('../services/databaseService');
const faceProcessingService = require('../services/faceProcessingService');

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Student enrollment endpoint
router.post('/enroll', upload.array('photos', 3), async (req, res) => {
  try {
    const { student_id, name, class: studentClass, section } = req.body;

    // Validate required fields
    if (!student_id || !name || !req.files || req.files.length !== 3) {
      return res.status(400).json({
        error: 'Student ID, name, and exactly 3 photos are required'
      });
    }

    // Check if student already exists
    const existingStudent = await databaseService.getStudentById(student_id);
    if (existingStudent) {
      return res.status(409).json({
        error: 'Student with this ID already exists'
      });
    }

    // Validate each photo
    const photoBuffers = req.files.map(file => file.buffer);
    const validationResults = [];

    for (let i = 0; i < photoBuffers.length; i++) {
      const validation = await faceProcessingService.validateFaceQuality(photoBuffers[i]);
      validationResults.push({
        photo: i + 1,
        ...validation
      });

      if (!validation.valid) {
        return res.status(400).json({
          error: `Photo ${i + 1} validation failed: ${validation.reason}`,
          validationResults
        });
      }
    }

    // Process enrollment photos to create face embedding
    const faceEmbedding = await faceProcessingService.processEnrollmentPhotos(photoBuffers);

    // Save student to database
    const studentData = {
      student_id,
      name,
      class: studentClass,
      section,
      face_embedding: faceEmbedding
    };

    const result = await databaseService.enrollStudent(studentData);

    res.status(201).json({
      message: 'Student enrolled successfully',
      student: {
        id: result.id,
        student_id: result.student_id,
        name,
        class: studentClass,
        section
      },
      validationResults
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      error: 'Failed to enroll student',
      details: error.message
    });
  }
});

// Face recognition endpoint
router.post('/recognize', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Photo is required for recognition'
      });
    }

    // Validate the photo
    const validation = await faceProcessingService.validateFaceQuality(req.file.buffer);
    if (!validation.valid) {
      return res.status(400).json({
        error: `Face validation failed: ${validation.reason}`
      });
    }

    // Extract face embedding from the photo
    const faceEmbedding = await faceProcessingService.extractFaceEmbedding(req.file.buffer);

    // Get all students from database
    const students = await databaseService.getAllStudents();

    if (students.length === 0) {
      return res.status(404).json({
        error: 'No students enrolled yet. Please enroll students first.'
      });
    }

    // Find best match
    const match = await faceProcessingService.findBestMatch(faceEmbedding, students);

    if (!match || !match.match) {
      return res.status(404).json({
        error: 'No matching face found',
        confidence: match ? match.confidence : 0
      });
    }

    // Record attendance
    try {
      await databaseService.recordAttendance(
        match.student.student_id,
        match.confidence
      );
    } catch (attendanceError) {
      console.error('Failed to record attendance:', attendanceError);
      // Don't fail the recognition if attendance recording fails
    }

    res.json({
      message: 'Face recognized successfully',
      student: {
        student_id: match.student.student_id,
        name: match.student.name,
        class: match.student.class,
        section: match.student.section
      },
      confidence: match.confidence,
      distance: match.distance,
      attendance_recorded: true
    });

  } catch (error) {
    console.error('Recognition error:', error);
    res.status(500).json({
      error: 'Failed to recognize face',
      details: error.message
    });
  }
});

// Get all students endpoint
router.get('/students', async (req, res) => {
  try {
    const students = await databaseService.getAllStudents();
    res.json({
      students,
      count: students.length
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      error: 'Failed to fetch students',
      details: error.message
    });
  }
});

// Get student by ID endpoint
router.get('/students/:studentId', async (req, res) => {
  try {
    const student = await databaseService.getStudentById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        error: 'Student not found'
      });
    }

    res.json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      error: 'Failed to fetch student',
      details: error.message
    });
  }
});

// Get today's attendance
router.get('/attendance/today', async (req, res) => {
  try {
    const attendance = await databaseService.getTodayAttendance();
    res.json({
      attendance,
      count: attendance.length,
      date: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      error: 'Failed to fetch attendance',
      details: error.message
    });
  }
});

// Get student attendance history
router.get('/attendance/:studentId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const attendance = await databaseService.getStudentAttendance(req.params.studentId, limit);
    res.json({
      student_id: req.params.studentId,
      attendance,
      count: attendance.length
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      error: 'Failed to fetch student attendance',
      details: error.message
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await databaseService.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
});

module.exports = router;
