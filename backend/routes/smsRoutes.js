const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');

// Send SMS notification to parent
router.post('/notify', async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }
    await smsService.sendSMS(phone, message);
    res.json({ message: 'SMS sent successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
