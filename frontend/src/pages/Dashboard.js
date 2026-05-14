import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  CalendarToday,
  Pending,
  AttachMoney,
  People,
  RoomService,
} from '@mui/icons-material';
import axios from 'axios';

function Dashboard() {
  const [overview, setOverview] = useState({
    total_bookings: 0,
    today_bookings: 0,
    pending_bookings: 0,
    total_revenue: 0,
    provider_count: 0,
    service_count: 0,
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await axios.get('/api/stats/overview');
      setOverview(response.data.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  const stats = [
    {
      title: '总预约数',
      value: overview.total_bookings,
      icon: <CalendarToday sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#e3f2fd',
    },
    {
      title: '今日预约',
      value: overview.today_bookings,
      icon: <Pending sx={{ fontSize: 40, color: '#ed6c02' }} />,
      color: '#fff3e0',
    },
    {
      title: '待处理预约',
      value: overview.pending_bookings,
      icon: <Pending sx={{ fontSize: 40, color: '#d32f2f' }} />,
      color: '#ffebee',
    },
    {
      title: '总收入',
      value: `¥${overview.total_revenue.toFixed(2)}`,
      icon: <AttachMoney sx={{ fontSize: 40, color: '#2e7d32' }} />,
      color: '#e8f5e9',
    },
    {
      title: '服务者数量',
      value: overview.provider_count,
      icon: <People sx={{ fontSize: 40, color: '#7b1fa2' }} />,
      color: '#f3e5f5',
    },
    {
      title: '服务项目数',
      value: overview.service_count,
      icon: <RoomService sx={{ fontSize: 40, color: '#0288d1' }} />,
      color: '#e1f5fe',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        仪表盘
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="div">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" color="primary">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
