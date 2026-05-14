import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';

function Schedule() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [dayOffs, setDayOffs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [batchDates, setBatchDates] = useState([]);

  useEffect(() => {
    fetchProviders();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSchedules();
      fetchDayOffs();
    }
  }, [selectedDate]);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/api/providers');
      setProviders(response.data.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules', {
        params: { date: selectedDate.format('YYYY-MM-DD') },
      });
      setSchedules(response.data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchDayOffs = async () => {
    try {
      const response = await axios.get('/api/day-offs', {
        params: { date: selectedDate.format('YYYY-MM-DD') },
      });
      setDayOffs(response.data.data);
    } catch (error) {
      console.error('Error fetching day offs:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddSchedule = async () => {
    try {
      await axios.post('/api/schedules', {
        provider_id: parseInt(selectedProvider),
        service_id: parseInt(selectedService),
        date: selectedDate.format('YYYY-MM-DD'),
        start_time: startTime,
        end_time: endTime,
      });
      fetchSchedules();
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const handleAddDayOff = async (providerId) => {
    try {
      await axios.post('/api/day-offs', {
        provider_id: providerId,
        date: selectedDate.format('YYYY-MM-DD'),
      });
      fetchDayOffs();
    } catch (error) {
      console.error('Error adding day off:', error);
    }
  };

  const handleDeleteDayOff = async (dayOffId) => {
    try {
      await axios.delete(`/api/day-offs/${dayOffId}`);
      fetchDayOffs();
    } catch (error) {
      console.error('Error deleting day off:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await axios.delete(`/api/schedules/${scheduleId}`);
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const isProviderDayOff = (providerId) => {
    return dayOffs.some(doff => doff.provider_id === providerId);
  };

  const getProviderDayOff = (providerId) => {
    return dayOffs.find(doff => doff.provider_id === providerId);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">排班日历</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
            添加排班
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  选择日期
                </Typography>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              {selectedDate.format('YYYY年MM月DD日')} 排班情况
            </Typography>
            {providers.map((provider) => {
              const providerSchedules = schedules.filter(
                (s) => s.provider_id === provider.id
              );
              const dayOff = getProviderDayOff(provider.id);

              return (
                <Card key={provider.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6">{provider.name}</Typography>
                      {dayOff ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip label="休息日" color="error" size="small" />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDayOff(dayOff.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleAddDayOff(provider.id)}
                        >
                          设为休息日
                        </Button>
                      )}
                    </Box>
                    {!dayOff && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {providerSchedules.map((schedule) => {
                          const service = services.find(
                            (s) => s.id === schedule.service_id
                          );
                          return (
                            <Chip
                              key={schedule.id}
                              label={`${service?.name || '未知服务'} ${schedule.start_time}-${schedule.end_time}`}
                              onDelete={() => handleDeleteSchedule(schedule.id)}
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                        {providerSchedules.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            暂无排班
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>添加排班</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                日期: {selectedDate.format('YYYY年MM月DD日')}
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>服务者</InputLabel>
                <Select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  label="服务者"
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>服务项目</InputLabel>
                <Select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  label="服务项目"
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="开始时间"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="结束时间"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>取消</Button>
            <Button onClick={handleAddSchedule} variant="contained">
              添加
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default Schedule;
