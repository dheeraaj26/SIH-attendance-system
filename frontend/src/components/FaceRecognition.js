import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

const FaceRecognition = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [faces, setFaces] = useState([]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');

    // Mock face detection
    const mockFaces = [
      { id: 1, name: 'Student 1', confidence: 95 },
      { id: 2, name: 'Student 2', confidence: 88 },
    ];

    setFaces(mockFaces);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t('faceRecognition.title')}
        </Typography>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <video
            ref={videoRef}
            style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }}
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {!isStreaming ? (
            <Button variant="contained" onClick={startCamera}>
              {t('faceRecognition.startCamera')}
            </Button>
          ) : (
            <>
              <Button variant="contained" onClick={detectFaces}>
                {t('faceRecognition.detectFaces')}
              </Button>
              <Button variant="outlined" onClick={stopCamera}>
                {t('faceRecognition.stopCamera')}
              </Button>
            </>
          )}
        </Box>
        {faces.length > 0 && (
          <Box>
            <Typography variant="h6">Detected Faces:</Typography>
            {faces.map(face => (
              <Typography key={face.id}>
                {face.name} - {face.confidence}% confidence
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FaceRecognition;
