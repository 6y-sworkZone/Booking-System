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
} from '@mui/material';
import { Cancel, Edit, Event } from '@mui/icons-material';
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
  const [editingBooking, setEditingBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');

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
                    <IconButton
                      color="error"
                      onClick={() => handleCancelBooking(booking.id)}
                      size="small"
                    >
                      <Cancel fontSize="small" />
                    </IconButton>
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
    </Box>
  );
}

export default BookingsList;
