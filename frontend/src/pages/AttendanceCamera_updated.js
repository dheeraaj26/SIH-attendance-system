import React, { useRef, useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Tooltip,
  Fab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CameraAlt,
  Stop,
  CheckCircle,
  Error,
  Help,
  PersonAdd,
  Face,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AttendanceCamera = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState(null);
  const [recognizedStudents, setRecognizedStudents] = useState([]);

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

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsStreaming(true);
      setError(null);
    } catch (err) {
      setError(t('camera.error'));
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const captureFaceData = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Mock API call - replace with real fetch to backend
    const response = await fetch('http://localhost:5000/api/face-recognition/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    const result = await response.json();

    if (result.faces && result.faces.length > 0) {
      setDetectionResult('success');
      // Mock recognized student
      const mockStudent = {
        id: Date.now(),
        name: 'Rahul Kumar',
        rollNumber: '001',
        confidence: 95,
      };
      setRecognizedStudents((prev) => [...prev, mockStudent]);
    } else {
      setDetectionResult('no-face');
    }
  };

  const handleRegistration = async () => {
    if (!registrationData.student_id || !registrationData.name) {
      setError('Please fill in Student ID and Name.');
      return;
    }

    setIsRegistering(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send to backend for registration
      const response = await fetch('http://localhost:5000/api/face-registration/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentData: registrationData,
          image: imageData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setError(null);
        setShowRegistrationDialog(false);
        setRegistrationData({
          student_id: '',
          name: '',
          class: '',
          section: '',
          phone: ''
        });
        alert(`Face registered successfully for ${registrationData.name}!`);
      } else {
        setError('Registration failed: ' + result.error);
      }
    } catch (error) {
      setError('Error during registration: ' + error.message);
      console.error('Registration error:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setDetectionResult(null);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Mock API call - replace with real fetch to backend
      const response = await fetch('http://localhost:5000/api/face-recognition/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const result = await response.json();

      if (result.faces && result.faces.length > 0) {
        setDetectionResult('success');
        // Mock recognized student
        const mockStudent = {
          id: Date.now(),
          name: 'Rahul Kumar',
          rollNumber: '001',
          confidence: 95,
        };
        setRecognizedStudents((prev) => [...prev, mockStudent]);
      } else {
        setDetectionResult('no-face');
      }
    } catch (err) {
      setDetectionResult('error');
      setError(t('camera.processingError'));
      console.error('Error processing image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const markAttendance = (studentId) => {
    // Mock attendance marking
    setRecognizedStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, marked: true } : student
      )
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        🎭 Face Recognition Attendance System
      </Typography>

      <Grid container spacing={3}>
        {/* Camera Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    borderRadius: '12px',
                    display: isStreaming ? 'block' : 'none',
                  }}
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                {!isStreaming && (
                  <Box
                    sx={{
                      height: '300px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: '12px',
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Box textAlign="center">
                      <CameraAlt sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        Camera is off. Click "Start Camera" to begin.
                      </Typography>
                    </Box>
                  </Box>
                )}
                {isProcessing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                    }}
                  >
                    <CircularProgress size={60} />
                    <Typography variant="body1" sx={{ mt: 1, color: 'white', textShadow: '1px 1px 2px black' }}>
                      Processing...
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {!isStreaming ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<CameraAlt />}
                    onClick={startCamera}
                  >
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      startIcon={<PersonAdd />}
                      onClick={() => setShowRegistrationDialog(true)}
                      disabled={isProcessing || isRegistering}
                    >
                      Register Face
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={isProcessing ? <CircularProgress size={20} /> : <Face />}
                      onClick={captureAndDetect}
                      disabled={isProcessing || isRegistering}
                    >
                      {isProcessing ? 'Processing...' : 'Take Attendance'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="large"
                      startIcon={<Stop />}
                      onClick={stopCamera}
                    >
                      Stop Camera
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Detection Result */}
          {detectionResult && (
            <Alert
              severity={
                detectionResult === 'success' ? 'success' :
                detectionResult === 'no-face' ? 'warning' : 'error'
              }
              sx={{ mt: 2 }}
              icon={
                detectionResult === 'success' ? <CheckCircle /> :
                detectionResult === 'no-face' ? <Help /> : <Error />
              }
            >
              {detectionResult === 'success' && 'Face detected and attendance marked!'}
              {detectionResult === 'no-face' && 'No face detected. Please position your face clearly.'}
              {detectionResult === 'error' && 'Error processing image. Please try again.'}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>

        {/* Recognized Students */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recognized Students
              </Typography>
              {recognizedStudents.length === 0 ? (
                <Typography color="textSecondary">
                  No students recognized yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {recognizedStudents.map((student) => (
                    <Box
                      key={student.id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: '8px',
                        bgcolor: student.marked ? 'success.light' : 'background.paper',
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {student.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Roll Number: {student.rollNumber}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip
                          label={`${student.confidence}%`}
                          color={student.confidence > 80 ? 'success' : 'warning'}
                          size="small"
                        />
                        {!student.marked && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            sx={{ ml: 'auto' }}
                            onClick={() => markAttendance(student.id)}
                          >
                            Mark Present
                          </Button>
                        )}
                        {student.marked && (
                          <CheckCircle color="success" sx={{ ml: 'auto' }} />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

      {/* Help Tooltip */}
      <Tooltip title="Click Register Face to add new students, or Take Attendance to mark attendance for registered students" arrow placement="top">
        <Fab
          color="secondary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <Help />
        </Fab>
      </Tooltip>
    </Container>
  );
};

export default AttendanceCamera;
