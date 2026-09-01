import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, Divider, LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  ShoppingCart, AttachMoney, LocalShipping, People, TrendingUp, Refresh,
  Download, Inventory, Category, Warning, CheckCircle, Cancel, Pending,
  Storefront,
} from '@mui/icons-material';
import { dashboardService } from '../services/dashboardService';
import websocketService from '../services/websocket';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    totalUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalCategories: 0,
    recentOrders: [],
    statusBreakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const token = localStorage.getItem('access_token');
    if (token) {
      websocketService.connect(token);
      websocketService.addListener(handleWebSocketMessage);
      setWsConnected(true);
    }
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    if (data.type === 'order_status_update') {
      fetchDashboardData();
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Staff privileges required.');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'info',
      ready: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Pending />,
      confirmed: <CheckCircle />,
      preparing: <LocalShipping />,
      ready: <CheckCircle />,
      completed: <CheckCircle />,
      cancelled: <Cancel />,
    };
    return icons[status] || null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchDashboardData}>Retry</Button>}>
          {error}
        </Alert>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      subtitle: `${stats.pendingOrders} pending`,
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      subtitle: `$${stats.todayRevenue?.toFixed(2)} today`,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#6F4E37',
      subtitle: `${stats.newUsersToday} new today`,
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      subtitle: `${stats.outOfStock} out of stock`,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Shop Banner */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #6F4E37 30%, #8B5E3C 90%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }} elevation={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Storefront sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">Manage Your Shop</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>View products, update stock, and explore the menu.</Typography>
          </Box>
        </Box>
        <Button variant="contained" component={Link} to="/shop" sx={{ bgcolor: 'white', color: '#6F4E37', '&:hover': { bgcolor: '#f5f5f5' }, fontWeight: 'bold', px: 4, py: 1.5 }}>Go to Shop</Button>
      </Paper>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh data"><IconButton onClick={fetchDashboardData} color="primary"><Refresh /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<Download />} size="small">Export Report</Button>
        </Box>
      </Box>

      {/* WebSocket Status */}
      <Alert severity={wsConnected ? 'success' : 'warning'} sx={{ mb: 3 }} icon={wsConnected ? <CheckCircle /> : <Warning />}>
        {wsConnected ? '🟢 Real-time updates connected' : '🟡 Real-time updates disconnected'}
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>{stat.title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
                    {stat.subtitle && <Typography variant="caption" color="text.secondary">{stat.subtitle}</Typography>}
                  </Box>
                  <Box sx={{ bgcolor: `${stat.color}20`, borderRadius: '50%', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order Status</Typography>
            <Divider sx={{ mb: 2 }} />
            {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => (
              <Box key={status} display="flex" alignItems="center" mb={1}>
                <Chip label={status.toUpperCase()} color={getStatusColor(status)} size="small" sx={{ mr: 1, minWidth: 80 }} />
                <LinearProgress variant="determinate" value={(count / stats.totalOrders) * 100 || 0} sx={{ flex: 1, mx: 1, height: 8, borderRadius: 4 }} />
                <Typography variant="body2">{count}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Revenue Overview</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box mb={2}><Typography variant="body2" color="text.secondary">Today</Typography><Typography variant="h5">${stats.todayRevenue?.toFixed(2) || '0.00'}</Typography></Box>
            <Box mb={2}><Typography variant="body2" color="text.secondary">This Week</Typography><Typography variant="h5">${stats.weekRevenue?.toFixed(2) || '0.00'}</Typography></Box>
            <Box><Typography variant="body2" color="text.secondary">Total</Typography><Typography variant="h5">${stats.totalRevenue?.toFixed(2) || '0.00'}</Typography></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Stats</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}><Box textAlign="center"><Typography variant="h4" color="warning.main">{stats.outOfStock || 0}</Typography><Typography variant="caption" color="text.secondary">Out of Stock</Typography></Box></Grid>
              <Grid item xs={6}><Box textAlign="center"><Typography variant="h4" color="info.main">{stats.lowStock || 0}</Typography><Typography variant="caption" color="text.secondary">Low Stock</Typography></Box></Grid>
              <Grid item xs={6}><Box textAlign="center"><Typography variant="h4" color="success.main">{stats.totalCategories || 0}</Typography><Typography variant="caption" color="text.secondary">Categories</Typography></Box></Grid>
              <Grid item xs={6}><Box textAlign="center"><Typography variant="h4" color="primary.main">{stats.newUsersWeek || 0}</Typography><Typography variant="caption" color="text.secondary">New Users (Week)</Typography></Box></Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Recent Orders</Typography>
          <Button size="small" color="primary">View All Orders</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell><Typography variant="body2" fontWeight="medium">{order.order_number}</Typography></TableCell>
                    <TableCell>{order.user_username || 'Guest'}</TableCell>
                    <TableCell align="right">${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell><Chip label={order.status?.toUpperCase() || 'N/A'} color={getStatusColor(order.status)} size="small" icon={getStatusIcon(order.status)} /></TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No orders found</Typography></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Dashboard;