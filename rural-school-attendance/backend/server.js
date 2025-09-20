require('dotenv').config();
const express = require('express');
const cors = require('cors');
const winston = require('winston');
const db = require('./models/db');
const attendanceRoutes = require('./routes/attendanceRoutes');
const syncRoutes = require('./routes/syncRoutes');
const smsRoutes = require('./routes/smsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Logger setup using winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
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

// Initialize database
db.init().catch(err => logger.error('Database initialization failed:', err));

// Routes
app.get('/', (req, res) => res.send('Hello World'));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/sms', smsRoutes);

// Simple login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Mock authentication
  if (username === 'admin' && password === 'password') {
    res.json({ token: 'mock-token', message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
