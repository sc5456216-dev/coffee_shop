import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiHelpers } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    password2: '' 
  });
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

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // ✅ Sends 'password' and 'password2' to match your serializer
      const response = await api.post('/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
      });
      
      // Your backend does NOT return tokens on registration, so redirect to login
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      if (err.response?.data) {
        const errors = Object.values(err.response.data).flat();
        setError(errors.join(' '));
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
        <Typography variant="h4" gutterBottom align="center">Create Account</Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Join us and start ordering your favorite coffee!
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Username" name="username" variant="outlined" fullWidth required value={formData.username} onChange={handleChange} />
          <TextField label="Email" type="email" name="email" variant="outlined" fullWidth required value={formData.email} onChange={handleChange} />
          <TextField label="Password" type="password" name="password" variant="outlined" fullWidth required value={formData.password} onChange={handleChange} />
          <TextField label="Confirm Password" type="password" name="password2" variant="outlined" fullWidth required value={formData.password2} onChange={handleChange} />
          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Already have an account? <Link to="/login" style={{ color: '#6F4E37', fontWeight: 'bold' }}>Login here</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;