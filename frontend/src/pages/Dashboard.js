import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom color="primary" align="center">
        {t('dashboard.title')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">{t('dashboard.attendanceStats')}</Typography>
              <Typography>{t('dashboard.totalStudents')}: 120</Typography>
              <Typography>{t('dashboard.presentToday')}: 110</Typography>
              <Button variant="contained" color="primary" href="/attendance-camera" sx={{ mt: 2 }}>
                {t('dashboard.markAttendance')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">{t('dashboard.syncStatus')}</Typography>
              <Typography>{t('dashboard.lastSync')}: 10 minutes ago</Typography>
              <Button variant="outlined" color="secondary" sx={{ mt: 2 }}>
                {t('dashboard.syncNow')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">{t('dashboard.recentActivity')}</Typography>
              <Typography>{t('dashboard.activityLog')}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
