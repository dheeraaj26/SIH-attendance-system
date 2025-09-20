const express = require('express');
const router = express.Router();
const faceRecognitionService = require('../services/faceRecognitionService');

// Detect faces in image
router.post('/detect', async (req, res, next) => {
  try {
    const { image } = req.body; // image as base64 string
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    const result = await faceRecognitionService.detectFaces(image);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Recognize face (placeholder for now)
router.post('/recognize', async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    const result = await faceRecognitionService.recognizeFace(image);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
