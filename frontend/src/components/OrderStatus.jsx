import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Stepper, Step, StepLabel, Paper, Typography, Chip, Alert, CircularProgress,
  Card, CardContent, Grid, Divider, Button, Stack,
} from '@mui/material';
import { CheckCircle, Pending, LocalShipping, Restaurant, Check, Cancel } from '@mui/icons-material';
import websocketService from '../services/websocket';
import api from '../services/api';

const orderSteps = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

const OrderStatus = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrderStatus();

    const handleWebSocketMessage = (data) => {
      if (data.type === 'order_status_update' && data.order_id === parseInt(orderId)) {
        setOrder(prev => ({
          ...prev,
          status: data.status,
          order_number: data.order_number,
        }));
      }
    };

    websocketService.addListener(handleWebSocketMessage);

    const token = localStorage.getItem('access_token');
    if (token && !websocketService.isConnected()) {
      websocketService.connect(token);
    }

    return () => {
      websocketService.removeListener(handleWebSocketMessage);
    };
  }, [orderId]);

  const fetchOrderStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!orderId) throw new Error("Order ID not found in URL");
      const response = await api.get(`/orders/${orderId}/`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please log in to view this order.');
      } else if (err.response?.status === 404) {
        setError('Order not found.');
      } else {
        setError('Failed to load order status');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW FUNCTION: Update the status
  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    setError(null);
    try {
      const response = await api.post(`/orders/${orderId}/update_status/`, { status: newStatus });
      
      // Update local state immediately
      setOrder(prev => ({ ...prev, status: newStatus }));
      
      // If you have a websocket, it will also update automatically
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Are you an admin?');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStepIcon = (step, index) => {
    const icons = {
      0: <Pending />,
      1: <CheckCircle />,
      2: <LocalShipping />,
      3: <Restaurant />,
      4: <Check />,
    };
    return icons[index] || null;
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  if (error || !order) {
    return <Alert severity="error" sx={{ m: 2 }}>{error || 'Order not found'}</Alert>;
  }

  const activeStep = orderSteps.indexOf(order.status);
  const isCompleted = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Order #{order.order_number}
        </Typography>
        <Chip
          label={order.status.toUpperCase()}
          color={isCancelled ? 'error' : isCompleted ? 'success' : 'warning'}
          icon={isCancelled ? <Cancel /> : isCompleted ? <Check /> : <Pending />}
        />
      </Box>

      {isCancelled ? (
        <Alert severity="error" sx={{ mt: 2 }}>This order has been cancelled.</Alert>
      ) : (
        <Stepper activeStep={activeStep} alternativeLabel>
          {orderSteps.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconComponent={() => getStepIcon(label, index)}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {/* ✅ NEW: Admin Controls to update status */}
      {!isCompleted && !isCancelled && (
        <Box mt={4} p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Admin: Update Order Status
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {orderSteps.map((status) => (
              <Button
                key={status}
                size="small"
                variant={order.status === status ? 'contained' : 'outlined'}
                color={order.status === status ? 'primary' : 'inherit'}
                disabled={updatingStatus}
                onClick={() => handleStatusUpdate(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              <Typography variant="h6" color="primary">${parseFloat(order.total_amount).toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Placed On</Typography>
              <Typography variant="body1">{new Date(order.created_at).toLocaleString()}</Typography>
            </Grid>
            {order.notes && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">Notes</Typography>
                <Typography variant="body1">{order.notes}</Typography>
              </Grid>
            )}
            {order.items && order.items.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>Items</Typography>
                {order.items.map((item, index) => (
                  <Box key={index} display="flex" justifyContent="space-between" py={0.5}>
                    <Typography variant="body2">{item.quantity}x {item.product_name}</Typography>
                    <Typography variant="body2">${parseFloat(item.price).toFixed(2)}</Typography>
                  </Box>
                ))}
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {!isCancelled && !isCompleted && (
        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            🟢 Live updates enabled - You'll see status changes in real-time
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default OrderStatus;