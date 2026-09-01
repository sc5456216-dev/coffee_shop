import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
import api, { apiHelpers } from '../services/api';

const TestApi = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Test public endpoint (products)
      const response = await api.get('/products/');
      setResult({
        success: true,
        message: '✅ API connection successful!',
        data: response.data,
        status: response.status,
      });
    } catch (err) {
      setError({
        message: '❌ API connection failed',
        details: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Test authenticated endpoint (needs login first)
      const response = await api.get('/dashboard/stats/');
      setResult({
        success: true,
        message: '✅ Authentication successful!',
        data: response.data,
        status: response.status,
      });
    } catch (err) {
      setError({
        message: '❌ Authentication failed. Please login first.',
        details: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        🔌 API Connection Test
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testConnection}
          disabled={loading}
        >
          Test Public API
        </Button>
        <Button 
          variant="outlined" 
          onClick={testAuth}
          disabled={loading}
        >
          Test Auth API
        </Button>
        <Button 
          variant="text" 
          onClick={() => {
            setResult(null);
            setError(null);
          }}
          disabled={loading}
        >
          Clear
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      )}

      {result && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="subtitle2">{result.message}</Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Status: {result.status}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Data: {JSON.stringify(result.data, null, 2)}
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle2">{error.message}</Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Status: {error.status || 'N/A'}
          </Typography>
          <Typography variant="caption" display="block">
            Details: {error.details}
          </Typography>
          {error.data && (
            <Typography variant="caption" display="block">
              Response: {JSON.stringify(error.data)}
            </Typography>
          )}
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" display="block">
          API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}
        </Typography>
        <Typography variant="caption" display="block">
          Authenticated: {apiHelpers.isAuthenticated() ? '✅ Yes' : '❌ No'}
        </Typography>
        <Typography variant="caption" display="block">
          Token Expired: {apiHelpers.isTokenExpired() ? '⚠️ Yes' : '✅ No'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default TestApi;