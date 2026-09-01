import React from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { Coffee, LocalShipping, AccessTime, Restaurant } from '@mui/icons-material';

const HomePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ bgcolor: '#6F4E37', color: 'white', p: 6, borderRadius: 4, mb: 4, textAlign: 'center', backgroundImage: 'linear-gradient(45deg, #6F4E37 30%, #8B5E3C 90%)' }}>
        <Coffee sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h2" gutterBottom fontWeight="bold">Welcome to Our Coffee Shop</Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>Crafted with love, served with passion.</Typography>
        <Button variant="contained" size="large" component={Link} to="/products" sx={{ bgcolor: 'white', color: '#6F4E37', '&:hover': { bgcolor: '#f5f5f5' }, px: 4, py: 2, fontSize: '1.1rem' }}>Browse Our Menu</Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { icon: <LocalShipping />, title: 'Fast Delivery', desc: 'Get your coffee delivered hot and fresh' },
          { icon: <AccessTime />, title: 'Quick Service', desc: 'Order ahead and skip the line' },
          { icon: <Restaurant />, title: 'Premium Quality', desc: 'Sourced from the best coffee beans' },
        ].map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ color: '#6F4E37', mb: 2, fontSize: 48 }}>{feature.icon}</Box>
                <Typography variant="h5" gutterBottom>{feature.title}</Typography>
                <Typography color="text.secondary">{feature.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;