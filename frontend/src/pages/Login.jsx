import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiHelpers } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ Use the standard JWT endpoint. 
      // SimpleJWT expects 'username' and 'password' by default.
      const response = await api.post('/token/', formData); 
      
      if (response.data.access) {
        apiHelpers.setAuthToken(response.data.access);
        apiHelpers.setRefreshToken(response.data.refresh);
        navigate('/dashboard');
      } else {
        setError('Invalid login response from server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else if (err.response?.data) {
        setError(Object.values(err.response.data).flat().join(' '));
      } else {
        setError('Failed to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">Welcome Back!</Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Login to your account to continue
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* CHANGED: Now asks for Username instead of Email */}
          <TextField 
            label="Username" 
            name="username" 
            variant="outlined" 
            fullWidth 
            required 
            value={formData.username} 
            onChange={handleChange} 
          />
          <TextField 
            label="Password" 
            type="password" 
            name="password" 
            variant="outlined" 
            fullWidth 
            required 
            value={formData.password} 
            onChange={handleChange} 
          />
          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Don't have an account? <Link to="/register" style={{ color: '#6F4E37', fontWeight: 'bold' }}>Register here</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;