import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Grid,
} from '@mui/material';
import { Cancel, Edit, Event, Schedule } from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';

const statusMap = {
  1: { label: '待确认', color: 'warning' },
  2: { label: '已确认', color: 'success' },
  3: { label: '已取消', color: 'error' },
};

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openRescheduleDialog, setOpenRescheduleDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [newDate, setNewDate] = useState(dayjs());
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await axios.get('/api/bookings', { params });
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleOpenEditDialog = (booking) => {
    setEditingBooking(booking);
    setNewStatus(booking.status);
    setRemark(booking.remark || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBooking(null);
  };

  const handleOpenRescheduleDialog = (booking) => {
    setReschedulingBooking(booking);
    setNewDate(dayjs(booking.date));
    setNewStartTime(booking.start_time);
    setNewEndTime(booking.end_time);
    setOpenRescheduleDialog(true);
  };

  const handleCloseRescheduleDialog = () => {
    setOpenRescheduleDialog(false);
    setReschedulingBooking(null);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`/api/bookings/${editingBooking.id}`, {
        status: parseInt(newStatus),
        remark: remark,
      });
      fetchBookings();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleReschedule = async () => {
    try {
      await axios.post(`/api/bookings/${reschedulingBooking.id}/reschedule`, {
        date: newDate.format('YYYY-MM-DD'),
        start_time: newStartTime,
        end_time: newEndTime,
      });
      fetchBookings();
      handleCloseRescheduleDialog();
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      alert(error.response?.data?.error || '改期失败，请重试');
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('确定要取消这个预约吗？')) {
      try {
        await axios.post(`/api/bookings/${id}/cancel`);
        fetchBookings();
      } catch (error) {
        console.error('Error canceling booking:', error);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h4">预约列表</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>状态筛选</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="状态筛选"
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="1">待确认</MenuItem>
              <MenuItem value="2">已确认</MenuItem>
              <MenuItem value="3">已取消</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>预约编号</TableCell>
                <TableCell>客户姓名</TableCell>
                <TableCell>客户电话</TableCell>
                <TableCell>日期</TableCell>
                <TableCell>时间</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>备注</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.booking_no}</TableCell>
                  <TableCell>{booking.customer_name}</TableCell>
                  <TableCell>{booking.customer_phone}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.start_time} - {booking.end_time}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[booking.status]?.label || '未知'}
                      color={statusMap[booking.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{booking.remark || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(booking)}
                      size="small"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    {booking.status !== 3 && (
                      <>
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenRescheduleDialog(booking)}
                          size="small"
                        >
                          <Schedule fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleCancelBooking(booking.id)}
                          size="small"
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>编辑预约 - {editingBooking?.booking_no}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>状态</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="状态"
                >
                  <MenuItem value={1}>待确认</MenuItem>
                  <MenuItem value={2}>已确认</MenuItem>
                  <MenuItem value={3}>已取消</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="备注"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>取消</Button>
            <Button onClick={handleUpdateStatus} variant="contained">
              保存
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openRescheduleDialog} onClose={handleCloseRescheduleDialog} maxWidth="md" fullWidth>
          <DialogTitle>改期预约 - {reschedulingBooking?.booking_no}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ pt: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  原预约信息
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>日期：</strong>{reschedulingBooking?.date}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>时间：</strong>{reschedulingBooking?.start_time} - {reschedulingBooking?.end_time}
                  </Typography>
                  <Typography variant="body2">
                    <strong>客户：</strong>{reschedulingBooking?.customer_name}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  选择新日期
                </Typography>
                <DateCalendar
                  value={newDate}
                  onChange={(newValue) => setNewDate(newValue)}
                  disablePast
                />
                <TextField
                  fullWidth
                  label="开始时间"
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="结束时间"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRescheduleDialog}>取消</Button>
            <Button onClick={handleReschedule} variant="contained">
              确认改期
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default BookingsList;
