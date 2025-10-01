import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Typography, Box, Alert, CircularProgress, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { CameraAlt, Stop, Face, CheckCircle, Error, PersonAdd } from '@mui/icons-material';

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

  // Registration state
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    student_id: '',
    name: '',
    class: '',
    section: '',
    phone: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);

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
      setMessage('Camera started. Choose "Register Face" to register a new student or "Take Attendance" to recognize.');
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

  const captureFaceData = async () => {
    if (!isStreaming || !modelsLoaded) return;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capture current frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Perform face detection
      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        setMessage('No face detected. Please position your face clearly in the frame.');
        return null;
      } else if (detections.length > 1) {
        setMessage('Multiple faces detected. Please ensure only one face is visible.');
        return null;
      } else {
        setMessage('Face captured successfully.');
        return detections[0].descriptor;
      }
    } catch (error) {
      setMessage('Error capturing face: ' + error.message);
      console.error('Face capture error:', error);
      return null;
    }
  };

  const handleRegistration = async () => {
    if (!registrationData.student_id || !registrationData.name) {
      setMessage('Please fill in Student ID and Name.');
      return;
    }

    setIsRegistering(true);
    setMessage('Capturing face for registration...');

    try {
      const faceDescriptor = await captureFaceData();

      if (!faceDescriptor) {
        setIsRegistering(false);
        return;
      }

      // Send to backend for registration
      const response = await fetch('http://localhost:5000/api/face-registration/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentData: registrationData,
          faceDescriptor: Array.from(faceDescriptor)
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`Face registered successfully for ${registrationData.name}!`);
        setShowRegistrationDialog(false);
        setRegistrationData({
          student_id: '',
          name: '',
          class: '',
          section: '',
          phone: ''
        });
      } else {
        setMessage('Registration failed: ' + result.error);
      }
    } catch (error) {
      setMessage('Error during registration: ' + error.message);
      console.error('Registration error:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAttendance = async () => {
    if (!isStreaming || !modelsLoaded) return;

    setIsRecognizing(true);
    setMessage('Capturing and recognizing face...');

    try {
      const faceDescriptor = await captureFaceData();

      if (!faceDescriptor) {
        setIsRecognizing(false);
        return;
      }

      // Send to backend for comparison
      const response = await fetch('http://localhost:5000/api/face-registration/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faceDescriptor: Array.from(faceDescriptor)
        }),
      });

      const result = await response.json();

      if (result.match) {
        // Mark attendance
        const attendanceResponse = await fetch('http://localhost:5000/api/face-registration/mark-attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: result.student.id,
            confidence: result.confidence
          }),
        });

        const attendanceResult = await attendanceResponse.json();

        setRecognitionResult({
          student: result.student,
          confidence: result.confidence,
          attendance_recorded: attendanceResult.success
        });

        setMessage(`Face recognized! Welcome, ${result.student.name}. ${attendanceResult.success ? 'Attendance marked!' : 'Attendance marking failed.'}`);
      } else {
        setMessage('No matching face found. Please register first.');
        setRecognitionResult(null);
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
            🎭 Face Recognition Attendance System
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Register students and take attendance using face recognition
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
                      startIcon={<PersonAdd />}
                      onClick={() => setShowRegistrationDialog(true)}
                      disabled={isRecognizing || isRegistering}
                      size="large"
                      color="secondary"
                    >
                      Register Face
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={isRecognizing ? <CircularProgress size={20} /> : <Face />}
                      onClick={handleAttendance}
                      disabled={isRecognizing || isRegistering || !modelsLoaded}
                      size="large"
                      color="primary"
                    >
                      {isRecognizing ? 'Recognizing...' : 'Take Attendance'}
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
                  : message.includes('recognized') || message.includes('registered') || message.includes('marked')
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
              1. Click "Start Camera" to activate your camera
              <br />
              2. For new students: Click "Register Face" and fill in student details
              <br />
              3. For attendance: Click "Take Attendance" to recognize and mark attendance
              <br />
              4. Attendance will be automatically recorded in the database
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onClose={() => setShowRegistrationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Student</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Student ID"
              value={registrationData.student_id}
              onChange={(e) => setRegistrationData({...registrationData, student_id: e.target.value})}
              required
              fullWidth
            />
            <TextField
              label="Name"
              value={registrationData.name}
              onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
              required
              fullWidth
            />
            <TextField
              label="Class"
              value={registrationData.class}
              onChange={(e) => setRegistrationData({...registrationData, class: e.target.value})}
              fullWidth
            />
            <TextField
              label="Section"
              value={registrationData.section}
              onChange={(e) => setRegistrationData({...registrationData, section: e.target.value})}
              fullWidth
            />
            <TextField
              label="Phone"
              value={registrationData.phone}
              onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRegistrationDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRegistration}
            variant="contained"
            disabled={isRegistering || !registrationData.student_id || !registrationData.name}
          >
            {isRegistering ? <CircularProgress size={20} /> : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
