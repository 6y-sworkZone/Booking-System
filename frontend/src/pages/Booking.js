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
  Chip,
} from '@mui/material';
import { EventAvailable } from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';

function Booking() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDayOff, setIsDayOff] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetchProviders();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedProvider && selectedService && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedProvider, selectedService, selectedDate]);

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

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get('/api/schedules/available', {
        params: {
          provider_id: selectedProvider,
          service_id: selectedService,
          date: selectedDate.format('YYYY-MM-DD'),
        },
      });
      setAvailableSlots(response.data.data);
      setIsDayOff(response.data.is_day_off);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      alert('请选择预约时间');
      return;
    }
    if (!customerName || !customerPhone) {
      alert('请填写姓名和电话');
      return;
    }

    try {
      await axios.post('/api/bookings', {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        provider_id: parseInt(selectedProvider),
        service_id: parseInt(selectedService),
        date: selectedDate.format('YYYY-MM-DD'),
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        remark: remark,
      });
      alert('预约成功！');
      fetchAvailableSlots();
      setSelectedSlot(null);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setRemark('');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.error || '预约失败，请重试');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" gutterBottom>
          预约服务
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  选择日期
                </Typography>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  disablePast
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  预约信息
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
                        {service.name} - ¥{service.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  可预约时段
                </Typography>
                {isDayOff ? (
                  <Typography variant="body1" color="error">
                    该服务者今日休息，请选择其他日期
                  </Typography>
                ) : availableSlots.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    暂无可用时段，请选择其他服务者、服务或日期
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableSlots.map((slot) => (
                      <Chip
                        key={slot.id}
                        label={`${slot.start_time} - ${slot.end_time}`}
                        onClick={() => setSelectedSlot(slot)}
                        color={selectedSlot?.id === slot.id ? 'primary' : 'default'}
                        variant={selectedSlot?.id === slot.id ? 'filled' : 'outlined'}
                        clickable
                        icon={<EventAvailable />}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  客户信息
                </Typography>
                <TextField
                  fullWidth
                  label="姓名"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="电话"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="邮箱"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="备注"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2 }}
                  onClick={handleBooking}
                  disabled={!selectedSlot}
                >
                  确认预约
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}

export default Booking;
