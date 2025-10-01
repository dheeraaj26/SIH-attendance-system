const { run, get, all } = require('../models/db');

class FaceRegistrationService {
  // Register a new face for a student
  async registerFace(studentData, faceDescriptor) {
    try {
      // Check if student already exists
      let student = await get('SELECT * FROM students WHERE student_id = ?', [studentData.student_id]);

      if (!student) {
        // Create new student
        const result = await run(
          'INSERT INTO students (student_id, name, class, section, phone) VALUES (?, ?, ?, ?, ?)',
          [studentData.student_id, studentData.name, studentData.class, studentData.section, studentData.phone]
        );
        student = { id: result.lastID };
      }

      // Store face descriptor
      await run(
        'INSERT INTO face_descriptors (student_id, descriptor, confidence) VALUES (?, ?, ?)',
        [student.id, JSON.stringify(faceDescriptor), 0.8]
      );

      return {
        success: true,
        student_id: studentData.student_id,
        message: 'Face registered successfully'
      };
    } catch (error) {
      console.error('Error registering face:', error);
      throw new Error('Face registration failed');
    }
  }

  // Get all registered faces for comparison
  async getAllRegisteredFaces() {
    try {
      const faces = await all(`
        SELECT
          fd.id,
          fd.student_id,
          fd.descriptor,
          s.name,
          s.class,
          s.section
        FROM face_descriptors fd
        JOIN students s ON fd.student_id = s.id
      `);

      return faces.map(face => ({
        id: face.id,
        student_id: face.student_id,
        name: face.name,
        class: face.class,
        section: face.section,
        descriptor: JSON.parse(face.descriptor)
      }));
    } catch (error) {
      console.error('Error getting registered faces:', error);
      throw new Error('Failed to retrieve registered faces');
    }
  }

  // Compare face descriptor with registered faces
  async compareFace(faceDescriptor) {
    try {
      const registeredFaces = await this.getAllRegisteredFaces();

      if (registeredFaces.length === 0) {
        return { match: false, message: 'No registered faces found' };
      }

      let bestMatch = null;
      let highestSimilarity = 0;

      for (const registeredFace of registeredFaces) {
        const similarity = this.calculateSimilarity(faceDescriptor, registeredFace.descriptor);

        if (similarity > highestSimilarity && similarity > 0.6) { // 0.6 threshold for matching
          highestSimilarity = similarity;
          bestMatch = registeredFace;
        }
      }

      if (bestMatch) {
        return {
          match: true,
          student: bestMatch,
          confidence: highestSimilarity,
          message: 'Face matched successfully'
        };
      } else {
        return {
          match: false,
          message: 'No matching face found'
        };
      }
    } catch (error) {
      console.error('Error comparing face:', error);
      throw new Error('Face comparison failed');
    }
  }

  // Calculate similarity between two face descriptors
  calculateSimilarity(descriptor1, descriptor2) {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < descriptor1.length; i++) {
      dotProduct += descriptor1[i] * descriptor2[i];
      norm1 += descriptor1[i] * descriptor1[i];
      norm2 += descriptor2[i] * descriptor2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  // Mark attendance for a student
  async markAttendance(studentId, confidence) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString();

      // Check if attendance already marked for today
      const existingAttendance = await get(
        'SELECT * FROM attendance_records WHERE student_id = ? AND date = ?',
        [studentId, today]
      );

      if (existingAttendance) {
        return {
          success: false,
          message: 'Attendance already marked for today'
        };
      }

      // Mark attendance
      await run(
        'INSERT INTO attendance_records (student_id, date, time, confidence) VALUES (?, ?, ?, ?)',
        [studentId, today, currentTime, confidence]
      );

      return {
        success: true,
        message: 'Attendance marked successfully'
      };
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw new Error('Failed to mark attendance');
    }
  }

  // Get attendance records for a date
  async getAttendanceRecords(date) {
    try {
      const records = await all(`
        SELECT
          ar.*,
          s.student_id,
          s.name,
          s.class,
          s.section
        FROM attendance_records ar
        JOIN students s ON ar.student_id = s.id
        WHERE ar.date = ?
        ORDER BY ar.created_at DESC
      `, [date]);

      return records;
    } catch (error) {
      console.error('Error getting attendance records:', error);
      throw new Error('Failed to retrieve attendance records');
    }
  }
}

module.exports = new FaceRegistrationService();
