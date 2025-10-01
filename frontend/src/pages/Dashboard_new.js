import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  School,
  CameraAlt,
  History,
  Notifications,
  Settings,
  Sync,
  CheckCircle,
  Warning,
  PersonAdd,
  Face,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock data - replace with real data from API
  const stats = {
    totalStudents: 45,
    presentToday: 42,
    absentToday: 3,
    syncStatus: 'synced', // 'syncing', 'error'
  };

  const quickActions = [
    {
      title: 'Enroll Student',
      subtitle: 'Add new students with face photos',
      icon: <PersonAdd fontSize="large" />,
      path: '/enroll-student',
      color: 'primary',
      description: 'Register new students by capturing 3 photos for face recognition'
    },
    {
      title: 'Face Recognition',
      subtitle: 'Mark attendance with face recognition',
      icon: <Face fontSize="large" />,
      path: '/face-recognition',
      color: 'success',
      description: 'Use camera to recognize students and mark attendance automatically'
    },
    {
      title: 'Attendance Camera',
      subtitle: 'Traditional attendance marking',
      icon: <CameraAlt fontSize="large" />,
      path: '/attendance-camera',
      color: 'secondary',
      description: 'Manual attendance marking with camera'
    },
    {
      title: 'View History',
      subtitle: 'Check attendance records',
      icon: <History fontSize="large" />,
      path: '/attendance-history',
      color: 'info',
      description: 'View historical attendance data and reports'
    },
  ];

  const getSyncStatus = () => {
    switch (stats.syncStatus) {
      case 'synced':
        return (
          <Alert severity="success" icon={<CheckCircle />}>
            Data synchronized successfully with server
          </Alert>
        );
      case 'syncing':
        return (
          <Alert severity="info">
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress />
            </Box>
            Synchronizing data...
          </Alert>
        );
      case 'error':
        return (
          <Alert severity="error" icon={<Warning />}>
            Sync error - Please check connection
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        📊 Attendance Dashboard
      </Typography>

      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Manage student enrollment and attendance with face recognition
      </Typography>

      {/* Sync Status Banner */}
      <Box sx={{ mb: 4 }}>
        {getSyncStatus()}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Present Today
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.presentToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Absent Today
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.absentToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Attendance Rate
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {Math.round((stats.presentToday / stats.totalStudents) * 100)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h4" component="h2" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {action.subtitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                  {action.description}
                </Typography>
                <Button variant="contained" color={action.color} size="large" fullWidth>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonAdd color="primary" sx={{ mr: 1 }} />
              <Typography>
                New student enrolled - Priya Sharma (Class 5A)
              </Typography>
              <Chip label="5 mins ago" size="small" sx={{ ml: 'auto' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Face color="success" sx={{ mr: 1 }} />
              <Typography>
                Face recognition attendance marked - 12 students recognized
              </Typography>
              <Chip label="10 mins ago" size="small" sx={{ ml: 'auto' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Sync color="info" sx={{ mr: 1 }} />
              <Typography>
                Data synchronized with government portal
              </Typography>
              <Chip label="15 mins ago" size="small" sx={{ ml: 'auto' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Notifications color="warning" sx={{ mr: 1 }} />
              <Typography>
                SMS notifications sent to parents of absent students
              </Typography>
              <Chip label="20 mins ago" size="small" sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* System Status */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          System Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Face Recognition</Typography>
                <Typography variant="body2" color="text.secondary">Online</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Database</Typography>
                <Typography variant="body2" color="text.secondary">Connected</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">SMS Service</Typography>
                <Typography variant="body2" color="text.secondary">Active</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Sync Status</Typography>
                <Typography variant="body2" color="text.secondary">Up to date</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
