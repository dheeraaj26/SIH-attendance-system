import React, { useState, useEffect } from 'react';
import { Chip, Box } from '@mui/material';
import { Wifi, WifiOff } from '@mui/icons-material';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1000 }}>
      <Chip
        icon={isOnline ? <Wifi /> : <WifiOff />}
        label={isOnline ? 'Online' : 'Offline'}
        color={isOnline ? 'success' : 'error'}
        variant="outlined"
      />
    </Box>
  );
};

export default OfflineIndicator;
