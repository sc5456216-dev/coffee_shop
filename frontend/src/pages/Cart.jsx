import React, { useState } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button, IconButton, Divider, Alert, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const DELIVERY_FEE = 2.99; 
  const FREE_DELIVERY_THRESHOLD = 25.00;

  const deliveryFee = totalAmount > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const finalTotal = totalAmount + deliveryFee;

  const handleQuantityChange = (id, variantId, newQty) => {
    if (newQty >= 1 && newQty <= 10) {
      updateQuantity(id, variantId, newQty);
    }
  };

  const handleRemove = (id, variantId) => {
    removeFromCart(id, variantId);
    setSnackbar({ open: true, message: 'Item removed from cart.', severity: 'info' });
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');

      // ✅ If not logged in, prompt to login, then redirect back to cart
      if (!token) {
        setSnackbar({ open: true, message: 'Please login to checkout.', severity: 'warning' });
        setLoading(false);
        
        // Save cart state so they don't lose items
        navigate('/login', { state: { from: '/cart' } });
        return;
      }

      const orderData = {
        notes: '',
        items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price),
          special_instructions: '',
        })),
      };

      // ✅ Send the request. The api.js interceptor will automatically add the Bearer token
      const response = await api.post('/orders/', orderData);
      
      clearCart();
      setSnackbar({
        open: true,
        message: `Order #${response.data.order_number} placed successfully!`,
        severity: 'success',
      });
      
      setTimeout(() => {
        navigate(`/order/${response.data.id}`);
      }, 1500);

    } catch (err) {
      console.error('Checkout error:', err);
      
      // ✅ If token is expired, clear it and redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setSnackbar({ open: true, message: 'Session expired. Please login again.', severity: 'warning' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        let errorMsg = 'Failed to place order. Please try again.';
        if (err.response?.data) {
          const errors = Object.values(err.response.data).flat();
          errorMsg = errors.join(' ');
        }
        setError(errorMsg);
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
        <Typography variant="h4" gutterBottom>Your cart is empty</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Looks like you haven't added anything yet. Let's fix that!
        </Typography>
        <Button variant="contained" size="large" component={Link} to="/products" sx={{ px: 4, py: 2 }}>
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => {
                    const subtotal = (item.price * item.quantity).toFixed(2);
                    return (
                      <TableRow key={`${item.id}-${item.variant?.id || 'default'}`}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} />
                            <Box>
                              <Typography variant="body1" fontWeight="medium">{item.name}</Typography>
                              {item.variant && (
                                <Typography variant="caption" color="text.secondary">Size: {item.variant.name}</Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">${parseFloat(item.price).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.variant?.id, item.quantity - 1)} disabled={item.quantity <= 1}><Remove fontSize="small" /></IconButton>
                            <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'center' }}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.variant?.id, item.quantity + 1)} disabled={item.quantity >= 10}><Add fontSize="small" /></IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right"><Typography variant="body1" fontWeight="bold">${subtotal}</Typography></TableCell>
                        <TableCell align="center"><IconButton color="error" onClick={() => handleRemove(item.id, item.variant?.id)}><Delete /></IconButton></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Button startIcon={<ArrowBack />} component={Link} to="/products" sx={{ mt: 2 }}>Continue Shopping</Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography color="text.secondary">Items ({itemCount})</Typography>
              <Typography>${totalAmount.toFixed(2)}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography color="text.secondary">Delivery Fee</Typography>
              <Typography color={deliveryFee === 0 ? 'success.main' : 'inherit'}>
                {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
              </Typography>
            </Box>
            
            {deliveryFee > 0 && (
              <Alert severity="info" sx={{ my: 1, py: 0 }}>
                Add ${(FREE_DELIVERY_THRESHOLD - totalAmount).toFixed(2)} more for FREE delivery!
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">${finalTotal.toFixed(2)}</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button variant="contained" fullWidth size="large" onClick={handleCheckout} disabled={loading} sx={{ py: 1.5, fontSize: '1.1rem' }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Proceed to Checkout'}
            </Button>

            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 2 }}>
              🔒 Secure Checkout
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;