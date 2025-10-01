const db = require('../models/database');

class DatabaseService {
  // Student operations
  async enrollStudent(studentData) {
    return new Promise((resolve, reject) => {
      const { student_id, name, class: studentClass, section, face_embedding } = studentData;

      db.run(
        `INSERT INTO students (student_id, name, class, section, face_embedding)
         VALUES (?, ?, ?, ?, ?)`,
        [student_id, name, studentClass, section, JSON.stringify(face_embedding)],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, student_id });
          }
        }
      );
    });
  }

  async getStudentById(studentId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM students WHERE student_id = ? AND is_active = 1',
        [studentId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              row.face_embedding = JSON.parse(row.face_embedding);
            }
            resolve(row);
          }
        }
      );
    });
  }

  async getAllStudents() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM students WHERE is_active = 1',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            rows.forEach(row => {
              if (row.face_embedding) {
                row.face_embedding = JSON.parse(row.face_embedding);
              }
            });
            resolve(rows);
          }
        }
      );
    });
  }

  async updateStudent(studentId, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates);
      const values = Object.values(updates);

      if (updates.face_embedding) {
        updates.face_embedding = JSON.stringify(updates.face_embedding);
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      values.push(studentId);

      db.run(
        `UPDATE students SET ${setClause} WHERE student_id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // Attendance operations
  async recordAttendance(studentId, confidenceScore = null) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO attendance_records (student_id, confidence_score) VALUES (?, ?)',
        [studentId, confidenceScore],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, student_id: studentId });
          }
        }
      );
    });
  }

  async getTodayAttendance() {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0];

      db.all(
        `SELECT ar.*, s.name, s.class, s.section
         FROM attendance_records ar
         JOIN students s ON ar.student_id = s.student_id
         WHERE DATE(ar.timestamp) = ?
         ORDER BY ar.timestamp DESC`,
        [today],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  async getStudentAttendance(studentId, limit = 30) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM attendance_records WHERE student_id = ? ORDER BY timestamp DESC LIMIT ?',
        [studentId, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Offline queue operations
  async addToOfflineQueue(operation, data) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO offline_queue (operation, data) VALUES (?, ?)',
        [operation, JSON.stringify(data)],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  }

  async getOfflineQueue() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM offline_queue ORDER BY timestamp ASC',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            rows.forEach(row => {
              row.data = JSON.parse(row.data);
            });
            resolve(rows);
          }
        }
      );
    });
  }

  async removeFromOfflineQueue(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM offline_queue WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  async incrementRetryCount(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE offline_queue SET retry_count = retry_count + 1 WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // Utility methods
  async getStats() {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0];

      db.get(
        `SELECT
          (SELECT COUNT(*) FROM students WHERE is_active = 1) as total_students,
          (SELECT COUNT(*) FROM attendance_records WHERE DATE(timestamp) = ?) as today_attendance,
          (SELECT COUNT(*) FROM offline_queue) as pending_sync`,
        [today],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
}

module.exports = new DatabaseService();
