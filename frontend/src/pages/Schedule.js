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
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add, Delete, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DateCalendar, PickersDay } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import axios from 'axios';

dayjs.extend(isBetween);

function Schedule() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentView, setCurrentView] = useState('day');
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [dayOffs, setDayOffs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    fetchProviders();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSchedulesForRange();
      fetchDayOffsForRange();
    }
  }, [selectedDate, currentView]);

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

  const getDateRange = () => {
    let startDate, endDate;
    if (currentView === 'day') {
      startDate = selectedDate;
      endDate = selectedDate;
    } else if (currentView === 'week') {
      startDate = selectedDate.startOf('week');
      endDate = selectedDate.endOf('week');
    } else if (currentView === 'month') {
      startDate = selectedDate.startOf('month');
      endDate = selectedDate.endOf('month');
    }
    return { startDate, endDate };
  };

  const fetchSchedulesForRange = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const allSchedules = [];
      let current = startDate;
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        const response = await axios.get('/api/schedules', {
          params: { date: current.format('YYYY-MM-DD') },
        });
        allSchedules.push(...response.data.data.map(s => ({ ...s, date_obj: current })));
        current = current.add(1, 'day');
      }
      setSchedules(allSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchDayOffsForRange = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const allDayOffs = [];
      let current = startDate;
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        const response = await axios.get('/api/day-offs', {
          params: { date: current.format('YYYY-MM-DD') },
        });
        allDayOffs.push(...response.data.data);
        current = current.add(1, 'day');
      }
      setDayOffs(allDayOffs);
    } catch (error) {
      console.error('Error fetching day offs:', error);
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setCurrentView(newView);
    }
  };

  const handlePrevious = () => {
    if (currentView === 'day') {
      setSelectedDate(selectedDate.subtract(1, 'day'));
    } else if (currentView === 'week') {
      setSelectedDate(selectedDate.subtract(1, 'week'));
    } else if (currentView === 'month') {
      setSelectedDate(selectedDate.subtract(1, 'month'));
    }
  };

  const handleNext = () => {
    if (currentView === 'day') {
      setSelectedDate(selectedDate.add(1, 'day'));
    } else if (currentView === 'week') {
      setSelectedDate(selectedDate.add(1, 'week'));
    } else if (currentView === 'month') {
      setSelectedDate(selectedDate.add(1, 'month'));
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenBatchDialog = () => {
    setSelectedDates([]);
    setOpenBatchDialog(true);
  };

  const handleCloseBatchDialog = () => {
    setOpenBatchDialog(false);
    setSelectedDates([]);
  };

  const handleDaySelect = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
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
      fetchSchedulesForRange();
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const handleBatchAddSchedule = async () => {
    if (selectedDates.length === 0) {
      alert('请至少选择一个日期');
      return;
    }
    try {
      await axios.post('/api/schedules/batch', {
        provider_id: parseInt(selectedProvider),
        service_id: parseInt(selectedService),
        dates: selectedDates,
        start_time: startTime,
        end_time: endTime,
      });
      fetchSchedulesForRange();
      handleCloseBatchDialog();
    } catch (error) {
      console.error('Error adding batch schedule:', error);
    }
  };

  const handleAddDayOff = async (providerId, date) => {
    try {
      await axios.post('/api/day-offs', {
        provider_id: providerId,
        date: date.format('YYYY-MM-DD'),
      });
      fetchDayOffsForRange();
    } catch (error) {
      console.error('Error adding day off:', error);
    }
  };

  const handleDeleteDayOff = async (dayOffId) => {
    try {
      await axios.delete(`/api/day-offs/${dayOffId}`);
      fetchDayOffsForRange();
    } catch (error) {
      console.error('Error deleting day off:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await axios.delete(`/api/schedules/${scheduleId}`);
      fetchSchedulesForRange();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const getProviderDayOff = (providerId, date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return dayOffs.find(doff => doff.provider_id === providerId && doff.date === dateStr);
  };

  const getProviderSchedules = (providerId, date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return schedules.filter(s => s.provider_id === providerId && s.date === dateStr);
  };

  const getWeekDates = () => {
    const startOfWeek = selectedDate.startOf('week');
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  };

  const getMonthDates = () => {
    const startOfMonth = selectedDate.startOf('month');
    const endOfMonth = selectedDate.endOf('month');
    const dates = [];
    let current = startOfMonth;
    while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, 'day')) {
      dates.push(current);
      current = current.add(1, 'day');
    }
    return dates;
  };

  const getViewTitle = () => {
    if (currentView === 'day') {
      return selectedDate.format('YYYY年MM月DD日');
    } else if (currentView === 'week') {
      const start = selectedDate.startOf('week').format('MM月DD日');
      const end = selectedDate.endOf('week').format('MM月DD日');
      return `${selectedDate.format('YYYY年')}${start} - ${end}`;
    } else {
      return selectedDate.format('YYYY年MM月');
    }
  };

  const renderDayView = () => (
    <Box>
      {providers.map((provider) => {
        const providerSchedules = getProviderSchedules(provider.id, selectedDate);
        const dayOff = getProviderDayOff(provider.id, selectedDate);

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
                    onClick={() => handleAddDayOff(provider.id, selectedDate)}
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
    </Box>
  );

  const renderWeekView = () => {
    const weekDates = getWeekDates();

    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 100, fontWeight: 'bold' }}>服务者</TableCell>
              {weekDates.map((date) => (
                <TableCell key={date.format()} align="center" sx={{ fontWeight: 'bold' }}>
                  {date.format('MM/DD')}
                  <br />
                  {['日', '一', '二', '三', '四', '五', '六'][date.day()]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>{provider.name}</TableCell>
                {weekDates.map((date) => {
                  const dayOff = getProviderDayOff(provider.id, date);
                  const providerSchedules = getProviderSchedules(provider.id, date);

                  return (
                    <TableCell key={date.format()} align="center">
                      {dayOff ? (
                        <Chip label="休息" color="error" size="small" />
                      ) : (
                        <Box>
                          {providerSchedules.map((schedule) => {
                            const service = services.find(
                              (s) => s.id === schedule.service_id
                            );
                            return (
                              <Chip
                                key={schedule.id}
                                label={`${schedule.start_time}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            );
                          })}
                        </Box>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates();
    const weeks = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }

    return (
      <Box>
        <Grid container spacing={1}>
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <Grid item xs key={day}>
              <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                {day}
              </Paper>
            </Grid>
          ))}
        </Grid>
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={1} key={weekIndex} sx={{ mt: 1 }}>
            {week.map((date) => {
              const dateStr = date.format('YYYY-MM-DD');
              const hasSchedules = providers.some(p => getProviderSchedules(p.id, date).length > 0);
              const hasDayOffs = providers.some(p => getProviderDayOff(p.id, date));

              return (
                <Grid item xs key={dateStr}>
                  <Paper
                    sx={{
                      p: 1,
                      minHeight: 80,
                      backgroundColor: date.isSame(dayjs(), 'day') ? '#e3f2fd' : 'transparent',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {date.date()}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {hasSchedules && (
                        <Chip label="有排班" size="small" color="primary" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                      {hasDayOffs && (
                        <Chip label="休息" size="small" color="error" variant="outlined" sx={{ mb: 0.5 }} />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
            {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
              <Grid item xs key={`empty-${i}`}>
                <Paper sx={{ p: 1, minHeight: 80, backgroundColor: '#fafafa' }} />
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h4">排班日历</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={currentView}
              exclusive
              onChange={handleViewChange}
              size="small"
            >
              <ToggleButton value="day">日</ToggleButton>
              <ToggleButton value="week">周</ToggleButton>
              <ToggleButton value="month">月</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={handlePrevious}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {getViewTitle()}
            </Typography>
            <IconButton onClick={handleNext}>
              <ChevronRight />
            </IconButton>
            <Button variant="outlined" startIcon={<Add />} onClick={handleOpenBatchDialog}>
              批量排班
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
              添加排班
            </Button>
          </Box>
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
            {currentView === 'day' && renderDayView()}
            {currentView === 'week' && renderWeekView()}
            {currentView === 'month' && renderMonthView()}
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

        <Dialog open={openBatchDialog} onClose={handleCloseBatchDialog} maxWidth="md" fullWidth>
          <DialogTitle>批量排班</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ pt: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  选择日期（已选 {selectedDates.length} 天）
                </Typography>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newValue) => handleDaySelect(newValue)}
                  slots={{
                    day: (props) => {
                      const isSelected = selectedDates.includes(props.day.format('YYYY-MM-DD'));
                      return (
                        <PickersDay
                          {...props}
                          sx={{
                            backgroundColor: isSelected ? '#1976d2 !important' : 'transparent',
                            color: isSelected ? 'white !important' : 'inherit',
                          }}
                        />
                      );
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    已选日期：
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedDates.map((date) => (
                      <Chip
                        key={date}
                        label={date}
                        size="small"
                        onDelete={() => setSelectedDates(selectedDates.filter(d => d !== date))}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBatchDialog}>取消</Button>
            <Button onClick={handleBatchAddSchedule} variant="contained" disabled={selectedDates.length === 0}>
              批量添加
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default Schedule;
