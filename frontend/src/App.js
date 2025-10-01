import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import AttendanceCamera from './pages/AttendanceCamera';
import LanguageSelector from './components/LanguageSelector';
import OfflineIndicator from './components/OfflineIndicator';
import FaceRecognition from './components/FaceRecognition';
import theme from './themes/theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <LanguageSelector />
        <OfflineIndicator />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance-camera" element={<AttendanceCamera />} />
          <Route path="/face-recognition" element={<FaceRecognition />} />
        </Routes>
      </Router>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
