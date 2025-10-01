require('dotenv').config();
const express = require('express');
const cors = require('cors');
const winston = require('winston');
const databaseService = require('./services/databaseService');
const attendanceRoutes = require('./routes/attendanceRoutes');
const syncRoutes = require('./routes/syncRoutes');
const smsRoutes = require('./routes/smsRoutes');
const faceRecognitionRoutes = require('./routes/faceRecognitionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Logger setup using winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/face-recognition', faceRecognitionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      faceRecognition: 'ready'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Face recognition API available at http://localhost:${PORT}/api/face-recognition`);
});
