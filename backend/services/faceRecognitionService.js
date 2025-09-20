const axios = require('axios');

const LUXAND_API_KEY = process.env.LUXAND_API_KEY || 'your_luxand_api_key_here'; // Replace with actual API key

class FaceRecognitionService {
  async detectFaces(imageBase64) {
    try {
      const response = await axios.post('https://api.luxand.cloud/photo/detect', {
        photo: imageBase64
      }, {
        headers: {
          'token': LUXAND_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error detecting faces:', error);
      throw new Error('Face detection failed');
    }
  }

  // For recognition, need to register faces first
  async recognizeFace(imageBase64) {
    // This would require storing face IDs and calling recognition API
    // For now, just detect
    return this.detectFaces(imageBase64);
  }
}

module.exports = new FaceRecognitionService();
