import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Attendance = () => {
  const { t } = useTranslation();
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance');
      const data = await response.json();
      setAttendanceRecords(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          date: new Date().toISOString().split('T')[0],
          status,
        }),
      });
      if (response.ok) {
        fetchAttendance();
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t('attendance.title')}
        </Typography>
        <List>
          {attendanceRecords.map(record => (
            <ListItem key={record.id}>
              <ListItemText
                primary={`Student ${record.student_id}`}
                secondary={`Date: ${record.date}, Status: ${record.status}`}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={() => markAttendance(1, 'present')}>
            Mark Student 1 Present
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Attendance;
