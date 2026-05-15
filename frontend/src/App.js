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
  Popover,
  List as MUIList,
  ListItem as MUIListItem,
  ListItemText as MUIListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  RoomService,
  People,
  CalendarToday,
  EventNote,
  Notifications,
  BarChart,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

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
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.data);
      const unread = response.data.data.filter(n => !n.is_read).length;
      setNotificationCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const menuItems = [
    { text: '仪表盘', icon: <DashboardIcon />, path: '/' },
    { text: '服务管理', icon: <RoomService />, path: '/services' },
    { text: '服务者管理', icon: <People />, path: '/providers' },
    { text: '排班日历', icon: <CalendarToday />, path: '/schedule' },
    { text: '预约服务', icon: <EventNote />, path: '/booking' },
    { text: '预约列表', icon: <EventNote />, path: '/bookings' },
    { text: '统计报表', icon: <BarChart />, path: '/stats' },
  ];

  const notificationOpen = Boolean(notificationAnchor);

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
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Popover
              open={notificationOpen}
              anchorEl={notificationAnchor}
              onClose={handleNotificationClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: { width: 400, maxHeight: 500 },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6">通知列表</Typography>
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    暂无通知
                  </Typography>
                </Box>
              ) : (
                <MUIList sx={{ p: 0 }}>
                  {notifications.map((notification) => (
                    <React.Fragment key={notification.id}>
                      <MUIListItem
                        sx={{
                          backgroundColor: notification.is_read ? 'transparent' : '#e3f2fd',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                        secondaryAction={
                          !notification.is_read && (
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle fontSize="small" color="primary" />
                            </IconButton>
                          )
                        }
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <MUIListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}>
                                  {notification.type === 1 ? '新预约' :
                                   notification.type === 2 ? '预约取消' :
                                   notification.type === 3 ? '预约改期' :
                                   notification.type === 4 ? '预约提醒' : '通知'}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="textSecondary">
                                  {dayjs(notification.created_at).format('YYYY-MM-DD HH:mm')}
                                </Typography>
                              }
                            />
                            {!notification.is_read && (
                              <Chip label="未读" size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
                            )}
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {notification.content}
                          </Typography>
                        </Box>
                      </MUIListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </MUIList>
              )}
            </Popover>
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
