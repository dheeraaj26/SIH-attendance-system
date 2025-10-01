import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField, Card, CardContent, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { CameraAlt, Save, Clear } from '@mui/icons-material';

export default function StudentEnrollment() {
  const { t } = useTranslation();
  const [studentData, setStudentData] = useState({
    student_id: '',
    name: '',
    class: '',
    section: ''
  });
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);
      setMessage('Camera started. Take 3 photos for enrollment.');
    } catch (error) {
      setMessage('Error accessing camera: ' + error.message);
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
    setMessage('Camera stopped.');
  };

  const capturePhoto = () => {
    if (!isCapturing || photos.length >= 3) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    const newPhotos = [...photos, photoData];
    setPhotos(newPhotos);
    setCurrentPhotoIndex(newPhotos.length - 1);

    if (newPhotos.length === 3) {
      setMessage('All 3 photos captured! Click "Enroll Student" to save.');
    } else {
      setMessage(`Photo ${newPhotos.length}/3 captured. Take ${3 - newPhotos.length} more photos.`);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setCurrentPhotoIndex(Math.min(currentPhotoIndex, newPhotos.length - 1));
    setMessage(`Photo removed. ${newPhotos.length}/3 photos remaining.`);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!studentData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
    }

    if (!studentData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!studentData.class.trim()) {
      newErrors.class = 'Class is required';
    }

    if (photos.length !== 3) {
      newErrors.photos = 'Exactly 3 photos are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage('Please fix the errors above.');
      return;
    }

    setIsLoading(true);
    setMessage('Enrolling student...');

    try {
      // Convert base64 images to blobs
      const photoFiles = photos.map((photoData, index) => {
        const response = { uri: photoData };
        response.type = 'image/jpeg';
        response.name = `photo_${index + 1}.jpg`;
        return response;
      });

      const formData = new FormData();
      formData.append('student_id', studentData.student_id);
      formData.append('name', studentData.name);
      formData.append('class', studentData.class);
      formData.append('section', studentData.section);

      photoFiles.forEach((photo, index) => {
        const blob = dataURItoBlob(photo.uri);
        formData.append('photos', blob, photo.name);
      });

      const response = await fetch('http://localhost:5000/api/face-recognition/enroll', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Student enrolled successfully!');
        // Reset form
        setStudentData({ student_id: '', name: '', class: '', section: '' });
        setPhotos([]);
        setCurrentPhotoIndex(0);
        setErrors({});
      } else {
        setMessage('Enrollment failed: ' + result.error);
      }
    } catch (error) {
      setMessage('Error enrolling student: ' + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleInputChange = (field) => (event) => {
    setStudentData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="student-enrollment-container">
      <Card sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            👤 Student Enrollment
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField
                label="Student ID"
                value={studentData.student_id}
                onChange={handleInputChange('student_id')}
                error={!!errors.student_id}
                helperText={errors.student_id}
                required
                fullWidth
              />

              <TextField
                label="Full Name"
                value={studentData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
                fullWidth
              />

              <TextField
                label="Class"
                value={studentData.class}
                onChange={handleInputChange('class')}
                error={!!errors.class}
                helperText={errors.class}
                required
                fullWidth
              />

              <TextField
                label="Section"
                value={studentData.section}
                onChange={handleInputChange('section')}
                fullWidth
              />
            </Box>

            {/* Camera Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📷 Capture 3 Photos
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', maxWidth: '640px', border: '2px solid #ccc' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!isCapturing ? (
                    <Button
                      variant="contained"
                      startIcon={<CameraAlt />}
                      onClick={startCamera}
                    >
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<CameraAlt />}
                        onClick={capturePhoto}
                        disabled={photos.length >= 3}
                      >
                        Capture Photo ({photos.length}/3)
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Clear />}
                        onClick={stopCamera}
                      >
                        Stop Camera
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Captured Photos
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {photos.map((photo, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        style={{
                          width: '200px',
                          height: '150px',
                          objectFit: 'cover',
                          border: '2px solid #ddd'
                        }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removePhoto(index)}
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          minWidth: 'auto',
                          padding: '4px'
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {errors.photos && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.photos}
              </Alert>
            )}

            {message && (
              <Alert
                severity={message.includes('Error') || message.includes('failed') ? 'error' : 'info'}
                sx={{ mb: 2 }}
              >
                {message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                disabled={isLoading || photos.length !== 3}
                sx={{ minWidth: 200 }}
              >
                {isLoading ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
