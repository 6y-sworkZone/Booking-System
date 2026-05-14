import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Badge,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  RoomService,
  People,
  CalendarToday,
  Appointment,
  Notifications,
  BarChart,
} from '@mui/icons-material';
import axios from 'axios';

import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Providers from './pages/Providers';
import Schedule from './pages/Schedule';
import Booking from './pages/Booking';
import BookingsList from './pages/BookingsList';
import Stats from './pages/Stats';

const drawerWidth = 240;

function App() {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      const unread = response.data.data.filter(n => !n.is_read).length;
      setNotificationCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const menuItems = [
    { text: '仪表盘', icon: <Dashboard />, path: '/' },
    { text: '服务管理', icon: <RoomService />, path: '/services' },
    { text: '服务者管理', icon: <People />, path: '/providers' },
    { text: '排班日历', icon: <CalendarToday />, path: '/schedule' },
    { text: '预约服务', icon: <Appointment />, path: '/booking' },
    { text: '预约列表', icon: <Appointment />, path: '/bookings' },
    { text: '统计报表', icon: <BarChart />, path: '/stats' },
  ];

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              预约排班系统
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  to={item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/bookings" element={<BookingsList />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
