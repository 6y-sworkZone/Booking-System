import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import { Edit, Delete, Add, Link } from '@mui/icons-material';
import axios from 'axios';

function Providers() {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBindDialog, setOpenBindDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [bindingProvider, setBindingProvider] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: '',
  });

  useEffect(() => {
    fetchProviders();
    fetchServices();
  }, []);

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

  const handleOpenDialog = (provider = null) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        phone: provider.phone,
        email: provider.email,
        avatar: provider.avatar,
      });
    } else {
      setEditingProvider(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        avatar: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      if (editingProvider) {
        await axios.put(`/api/providers/${editingProvider.id}`, formData);
      } else {
        await axios.post('/api/providers', formData);
      }
      fetchProviders();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving provider:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个服务者吗？')) {
      try {
        await axios.delete(`/api/providers/${id}`);
        fetchProviders();
      } catch (error) {
        console.error('Error deleting provider:', error);
      }
    }
  };

  const handleOpenBindDialog = async (provider) => {
    setBindingProvider(provider);
    try {
      const response = await axios.get(`/api/providers/${provider.id}/services`);
      setSelectedServices(response.data.data.map(s => s.id));
    } catch (error) {
      console.error('Error fetching provider services:', error);
    }
    setOpenBindDialog(true);
  };

  const handleCloseBindDialog = () => {
    setOpenBindDialog(false);
  };

  const handleBindServices = async () => {
    try {
      await axios.post(`/api/providers/${bindingProvider.id}/bind-services`, {
        service_ids: selectedServices,
      });
      fetchProviders();
      handleCloseBindDialog();
    } catch (error) {
      console.error('Error binding services:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">服务者管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          添加服务者
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>电话</TableCell>
              <TableCell>邮箱</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>{provider.id}</TableCell>
                <TableCell>{provider.name}</TableCell>
                <TableCell>{provider.phone || '-'}</TableCell>
                <TableCell>{provider.email || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={provider.status === 1 ? '启用' : '禁用'}
                    color={provider.status === 1 ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(provider)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleOpenBindDialog(provider)}
                  >
                    <Link />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(provider.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProvider ? '编辑服务者' : '添加服务者'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="姓名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="电话"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="邮箱"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openBindDialog} onClose={handleCloseBindDialog} maxWidth="sm" fullWidth>
        <DialogTitle>绑定服务 - {bindingProvider?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>选择服务</InputLabel>
              <Select
                multiple
                value={selectedServices}
                onChange={(e) => setSelectedServices(e.target.value)}
                input={<OutlinedInput label="选择服务" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const service = services.find(s => s.id === id);
                      return service ? (
                        <Chip key={id} label={service.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBindDialog}>取消</Button>
          <Button onClick={handleBindServices} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Providers;
