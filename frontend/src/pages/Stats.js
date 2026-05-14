import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function Stats() {
  const [dailyBookings, setDailyBookings] = useState([]);
  const [providerWorkload, setProviderWorkload] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [overview, setOverview] = useState({
    total_bookings: 0,
    today_bookings: 0,
    pending_bookings: 0,
    total_revenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [dailyRes, providerRes, serviceRes, overviewRes] = await Promise.all([
        axios.get('/api/stats/daily-bookings'),
        axios.get('/api/stats/provider-workload'),
        axios.get('/api/stats/popular-services'),
        axios.get('/api/stats/overview'),
      ]);

      setDailyBookings(dailyRes.data.data);
      setProviderWorkload(providerRes.data.data);
      setPopularServices(serviceRes.data.data);
      setOverview(overviewRes.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        统计报表
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                总预约数
              </Typography>
              <Typography variant="h4">{overview.total_bookings}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                今日预约
              </Typography>
              <Typography variant="h4">{overview.today_bookings}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                待处理
              </Typography>
              <Typography variant="h4" color="orange">{overview.pending_bookings}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                总收入
              </Typography>
              <Typography variant="h4" color="green">¥{overview.total_revenue?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                每日预约趋势
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyBookings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="预约数" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                服务者工作量
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerWorkload}
                    dataKey="count"
                    nameKey="provider_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {providerWorkload.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                热门服务排行
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>排名</TableCell>
                      <TableCell>服务名称</TableCell>
                      <TableCell>预约次数</TableCell>
                      <TableCell>收入</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {popularServices.map((service, index) => (
                      <TableRow key={service.service_id}>
                        <TableCell>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </TableCell>
                        <TableCell>{service.service_name || '未知服务'}</TableCell>
                        <TableCell>{service.count}</TableCell>
                        <TableCell>¥{service.revenue?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Stats;
