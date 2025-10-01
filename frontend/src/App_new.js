import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Box, Fab, Alert } from '@mui/material';
import { Menu, Home, CameraAlt, List, History, Notifications, Settings, Language, Wifi, WifiOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Joyride from 'react-joyride';
import theme from './themes/theme';
import Dashboard from './pages/Dashboard';
import AttendanceCamera from './pages/AttendanceCamera';
import StudentEnrollment from './components/StudentEnrollment';
import FaceRecognition from './components/FaceRecognition_new';
// Import other pages as created
// import ClassList from './pages/ClassList';
// import AttendanceHistory from './pages/AttendanceHistory';
// import NotificationsPage from './pages/Notifications';
// import SettingsPage from './pages/Settings';
import LanguageSelector from './components/LanguageSelector';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if first time user
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRunTour(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTourComplete = () => {
    setRunTour(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const tourSteps = [
    {
      target: '.dashboard-link',
      content: t('tour.welcome'),
    },
    {
      target: '.camera-link',
      content: t('tour.camera'),
    },
    {
      target: '.language-selector',
      content: t('tour.language'),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {t('app.title')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box className="language-selector">
                  <LanguageSelector />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isOnline ? <Wifi color="success" /> : <WifiOff color="error" />}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {isOnline ? t('app.online') : t('app.offline')}
                  </Typography>
                </Box>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Offline Banner */}
          {!isOnline && (
            <Alert severity="warning" sx={{ borderRadius: 0 }}>
              {t('app.offlineMessage')}
            </Alert>
          )}

          <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/attendance-camera" element={<AttendanceCamera />} />
              <Route path="/enroll-student" element={<StudentEnrollment />} />
              <Route path="/face-recognition" element={<FaceRecognition />} />
              {/* Add other routes as pages are created */}
              {/* <Route path="/class-list" element={<ClassList />} /> */}
              {/* <Route path="/attendance-history" element={<AttendanceHistory />} /> */}
              {/* <Route path="/notifications" element={<NotificationsPage />} /> */}
              {/* <Route path="/settings" element={<SettingsPage />} /> */}
            </Routes>
          </Container>

          {/* Floating Action Button for Quick Actions */}
          <Fab
            color="primary"
            aria-label="menu"
            sx={{ position: 'fixed', bottom: 16, left: 16 }}
            onClick={() => setRunTour(true)}
          >
            <Menu />
          </Fab>
        </Box>

        {/* Onboarding Tour */}
        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous
          showProgress
          showSkipButton
          callback={(data) => {
            if (data.status === 'finished' || data.status === 'skipped') {
              handleTourComplete();
            }
          }}
          styles={{
            options: {
              primaryColor: theme.palette.primary.main,
            },
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
