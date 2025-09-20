const express = require('express');
const router = express.Router();
const { sendSMS } = require('../services/smsService');

// Send SMS notification to parent
router.post('/notify', async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }
    const response = await sendSMS(phone, message);
    res.json({ message: 'SMS sent successfully', sid: response.sid });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
