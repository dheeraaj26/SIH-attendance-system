const tf = require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');

class FaceProcessingService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing face processing service...');

      // Load models from CDN
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/'),
        faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')
      ]);

      this.isInitialized = true;
      console.log('Face processing service initialized successfully');
    } catch (error) {
      console.error('Error initializing face processing service:', error);
      throw new Error('Failed to load face recognition models. Please check your internet connection.');
    }
  }

  // Extract face embedding from image buffer
  async extractFaceEmbedding(imageBuffer) {
    await this.initialize();

    try {
      // Convert buffer to tensor
      const tensor = tf.node.decodeImage(imageBuffer, 3);
      const image = faceapi.tf.tensor3d(tensor.arraySync(), tensor.shape);

      // Detect faces
      const detections = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        throw new Error('No faces detected in the image');
      }

      if (detections.length > 1) {
        throw new Error('Multiple faces detected. Please ensure only one face is visible.');
      }

      const faceDescriptor = detections[0].descriptor;

      // Clean up tensors
      tensor.dispose();
      image.dispose();

      return Array.from(faceDescriptor);
    } catch (error) {
      console.error('Error extracting face embedding:', error);
      throw error;
    }
  }

  // Compare two face embeddings
  compareFaces(embedding1, embedding2, threshold = 0.6) {
    if (!embedding1 || !embedding2) {
      return { match: false, distance: 1, confidence: 0 };
    }

    if (embedding1.length !== embedding2.length) {
      throw new Error('Face embeddings must have the same length');
    }

    // Calculate Euclidean distance
    let distance = 0;
    for (let i = 0; i < embedding1.length; i++) {
      const diff = embedding1[i] - embedding2[i];
      distance += diff * diff;
    }
    distance = Math.sqrt(distance);

    // Convert distance to confidence score (0-1)
    const confidence = Math.max(0, Math.min(1, 1 - distance));

    return {
      match: distance < threshold,
      distance: distance,
      confidence: confidence
    };
  }

  // Find best match from multiple embeddings
  async findBestMatch(targetEmbedding, storedEmbeddings, threshold = 0.6) {
    let bestMatch = null;
    let bestScore = 0;
    let bestDistance = Infinity;

    for (const stored of storedEmbeddings) {
      const comparison = this.compareFaces(targetEmbedding, stored.face_embedding, threshold);

      if (comparison.confidence > bestScore) {
        bestScore = comparison.confidence;
        bestDistance = comparison.distance;
        bestMatch = {
          student: stored,
          confidence: comparison.confidence,
          distance: comparison.distance,
          match: comparison.match
        };
      }
    }

    return bestMatch;
  }

  // Process multiple photos for enrollment (takes 3 photos and creates average embedding)
  async processEnrollmentPhotos(photoBuffers) {
    if (photoBuffers.length !== 3) {
      throw new Error('Exactly 3 photos are required for enrollment');
    }

    await this.initialize();

    try {
      const embeddings = [];

      // Extract embedding from each photo
      for (const buffer of photoBuffers) {
        const embedding = await this.extractFaceEmbedding(buffer);
        embeddings.push(embedding);
      }

      // Calculate average embedding
      const averagedEmbedding = this.averageEmbeddings(embeddings);

      return averagedEmbedding;
    } catch (error) {
      console.error('Error processing enrollment photos:', error);
      throw error;
    }
  }

  // Calculate average of multiple embeddings
  averageEmbeddings(embeddings) {
    if (embeddings.length === 0) {
      throw new Error('No embeddings provided');
    }

    const length = embeddings[0].length;
    const averaged = new Array(length).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < length; i++) {
        averaged[i] += embedding[i];
      }
    }

    for (let i = 0; i < length; i++) {
      averaged[i] /= embeddings.length;
    }

    return averaged;
  }

  // Validate face quality
  async validateFaceQuality(imageBuffer) {
    await this.initialize();

    try {
      const tensor = tf.node.decodeImage(imageBuffer, 3);
      const image = faceapi.tf.tensor3d(tensor.arraySync(), tensor.shape);

      const detections = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({ minConfidence: 0.5 }));

      tensor.dispose();
      image.dispose();

      if (detections.length === 0) {
        return { valid: false, reason: 'No face detected' };
      }

      if (detections.length > 1) {
        return { valid: false, reason: 'Multiple faces detected' };
      }

      const detection = detections[0];
      const box = detection.box;

      // Check if face is large enough (at least 100x100 pixels)
      const minSize = 100;
      if (box.width < minSize || box.height < minSize) {
        return { valid: false, reason: 'Face too small. Please move closer to the camera.' };
      }

      // Check if face is well-centered
      const imageWidth = tensor.shape[1];
      const imageHeight = tensor.shape[0];
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      const centerThreshold = 0.3; // 30% from center
      const centerXRatio = Math.abs(centerX - imageWidth / 2) / (imageWidth / 2);
      const centerYRatio = Math.abs(centerY - imageHeight / 2) / (imageHeight / 2);

      if (centerXRatio > centerThreshold || centerYRatio > centerThreshold) {
        return { valid: false, reason: 'Face not centered. Please position your face in the center of the frame.' };
      }

      return { valid: true, detection };
    } catch (error) {
      console.error('Error validating face quality:', error);
      return { valid: false, reason: 'Error processing image' };
    }
  }
}

module.exports = new FaceProcessingService();
