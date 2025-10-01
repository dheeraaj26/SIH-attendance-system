# Face Detection Models

This directory should contain the following model files for face-api.js:

## Required Models:

1. **Tiny Face Detector Models:**
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1.shard`

2. **Face Landmark Models:**
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1.shard`

3. **Face Recognition Models:**
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1.shard`
   - `face_recognition_model-shard2.shard`

## How to Download:

You can download these models from the official face-api.js repository:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Or use this direct download script:

```bash
# Download all required models
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1.shard
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1.shard
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1.shard
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2.shard
```

## Alternative: Use CDN

You can also modify the FaceRecognition component to load models from CDN:
```javascript
await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/');
