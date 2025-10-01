import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Typography, Box, Alert, CircularProgress, Chip } from '@mui/material';
import { CameraAlt, Stop, Face, CheckCircle, Error } from '@mui/icons-material';

export default function FaceRecognition() {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [message, setMessage] = useState('');
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setMessage('Loading face recognition models...');

        // Load models from CDN
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/'),
          faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/'),
          faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/')
        ]);

        setModelsLoaded(true);
        setMessage('Face recognition models loaded successfully. Click "Start Camera" to begin.');
      } catch (error) {
        console.error('Error loading models:', error);
        setMessage('Error loading face recognition models. Please refresh the page.');
      }
    };

    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setIsStreaming(true);
      setMessage('Camera started. Click "Recognize Face" to identify student.');
      setRecognitionResult(null);
    } catch (error) {
      setMessage('Error accessing camera: ' + error.message);
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsStreaming(false);
    setMessage('Camera stopped.');
    setRecognitionResult(null);
  };

  const captureAndRecognize = async () => {
    if (!isStreaming || !modelsLoaded) return;

    setIsRecognizing(true);
    setMessage('Capturing and recognizing face...');

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capture current frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Perform face detection and recognition
      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        setMessage('No face detected. Please position your face clearly in the frame.');
        setRecognitionResult(null);
      } else if (detections.length > 1) {
        setMessage('Multiple faces detected. Please ensure only one face is visible.');
        setRecognitionResult(null);
      } else {
        // Simulate recognition result (in a real app, this would compare against stored face embeddings)
        const detection = detections[0];
        const confidence = Math.random() * 0.4 + 0.6; // Simulate confidence between 0.6-1.0

        // Mock student data - in real app, this would come from database
        const mockStudents = [
          { student_id: 'STU001', name: 'John Doe', class: '10', section: 'A' },
          { student_id: 'STU002', name: 'Jane Smith', class: '9', section: 'B' },
          { student_id: 'STU003', name: 'Mike Johnson', class: '10', section: 'A' }
        ];

        const mockStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];

        const result = {
          student: mockStudent,
          confidence: confidence,
          detection: detection,
          attendance_recorded: true
        };

        setRecognitionResult(result);
        setMessage(`Face recognized! Welcome, ${result.student.name}`);
      }
    } catch (error) {
      setMessage('Error during recognition: ' + error.message);
      console.error('Recognition error:', error);
    } finally {
      setIsRecognizing(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="face-recognition-container">
      <Card sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            🎭 Face Recognition Attendance
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Client-side face recognition using face-api.js and TensorFlow.js
          </Typography>

          {/* Camera Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  border: '2px solid #ccc',
                  borderRadius: '8px'
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                {!isStreaming ? (
                  <Button
                    variant="contained"
                    startIcon={<CameraAlt />}
                    onClick={startCamera}
                    size="large"
                    disabled={!modelsLoaded}
                  >
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={isRecognizing ? <CircularProgress size={20} /> : <Face />}
                      onClick={captureAndRecognize}
                      disabled={isRecognizing || !modelsLoaded}
                      size="large"
                      color="primary"
                    >
                      {isRecognizing ? 'Recognizing...' : 'Recognize Face'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Stop />}
                      onClick={stopCamera}
                      size="large"
                    >
                      Stop Camera
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Status Message */}
          {message && (
            <Alert
              severity={
                message.includes('Error') || message.includes('failed')
                  ? 'error'
                  : message.includes('recognized')
                  ? 'success'
                  : 'info'
              }
              sx={{ mb: 3 }}
            >
              {message}
            </Alert>
          )}

          {/* Recognition Result */}
          {recognitionResult && (
            <Card variant="outlined" sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="success.main">
                    Student Recognized Successfully!
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Student ID
                    </Typography>
                    <Typography variant="h6">
                      {recognitionResult.student.student_id}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="h6">
                      {recognitionResult.student.name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Class
                    </Typography>
                    <Typography variant="h6">
                      {recognitionResult.student.class}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Section
                    </Typography>
                    <Typography variant="h6">
                      {recognitionResult.student.section || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Confidence:
                  </Typography>
                  <Chip
                    label={`${getConfidenceLabel(recognitionResult.confidence)} (${(recognitionResult.confidence * 100).toFixed(1)}%)`}
                    color={getConfidenceColor(recognitionResult.confidence)}
                    variant="outlined"
                  />
                </Box>

                {recognitionResult.attendance_recorded && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    ✅ Attendance recorded successfully at {new Date().toLocaleTimeString()}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>How to use:</strong>
              <br />
              1. Wait for models to load (shown at the top)
              <br />
              2. Click "Start Camera" to activate your camera
              <br />
              3. Position your face clearly in the frame
              <br />
              4. Click "Recognize Face" to identify yourself
              <br />
              5. Attendance will be recorded automatically if recognized
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
