import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Rating,
  Breadcrumbs,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  AccessTime,
  CheckCircle,
  Favorite,
  FavoriteBorder,
  Share,
} from '@mui/icons-material';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProduct(slug);
      setProduct(data);
      // Select first variant if available
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const getFinalPrice = () => {
    if (!product) return 0;
    if (selectedVariant) {
      return parseFloat(product.price) + parseFloat(selectedVariant.price_adjustment || 0);
    }
    return parseFloat(product.price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: getFinalPrice(),
      quantity: quantity,
      image: product.image,
      variant: selectedVariant,
      slug: product.slug,
    };
    
    addToCart(cartItem);
    setSnackbar({
      open: true,
      message: `${product.name} added to cart!`,
      severity: 'success',
    });
  };

  const handleOrderNow = () => {
    handleAddToCart();
    setTimeout(() => {
      navigate('/cart');
    }, 500);
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/600x400?text=Coffee';
    if (image.startsWith('http')) return image;
    return `http://localhost:8001${image}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</Link>
        <Typography color="textPrimary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400?text=Coffee';
              }}
            />
            {product.is_featured && (
              <Chip
                label="Featured"
                color="secondary"
                sx={{ position: 'absolute', top: 20, right: 20 }}
              />
            )}
            <Box sx={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 1 }}>
              <IconButton 
                sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
              <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}>
                <Share />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              {product.name}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip 
                label={product.is_available ? 'In Stock' : 'Out of Stock'}
                color={product.is_available ? 'success' : 'error'}
              />
              <Box display="flex" alignItems="center">
                <Rating value={4.5} precision={0.5} readOnly size="small" />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (24 reviews)
                </Typography>
              </Box>
            </Box>

            <Typography variant="h4" color="primary" gutterBottom>
              ${getFinalPrice().toFixed(2)}
            </Typography>

            <Typography variant="body1" paragraph color="text.secondary">
              {product.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Product Info Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <AccessTime color="action" />
                    <Typography variant="caption" display="block">
                      {product.preparation_time} min
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Prep Time
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <LocalShipping color="action" />
                    <Typography variant="caption" display="block">
                      Free
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Delivery
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <CheckCircle color="action" />
                    <Typography variant="caption" display="block">
                      {product.is_available ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Available
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Size:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {product.variants.map((variant) => (
                    <Chip
                      key={variant.id}
                      label={`${variant.name} ($${(parseFloat(product.price) + parseFloat(variant.price_adjustment || 0)).toFixed(2)})`}
                      onClick={() => setSelectedVariant(variant)}
                      color={selectedVariant?.id === variant.id ? 'primary' : 'default'}
                      variant={selectedVariant?.id === variant.id ? 'filled' : 'outlined'}
                      disabled={!variant.is_active}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Quantity and Add to Cart */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="subtitle1">Qty:</Typography>
              <Box display="flex" alignItems="center">
                <IconButton 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  size="small"
                  sx={{ border: '1px solid #ddd', borderRadius: 1 }}
                >
                  <Remove />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= 10) setQuantity(val);
                  }}
                  size="small"
                  sx={{ width: 60, mx: 1, '& input': { textAlign: 'center' } }}
                  inputProps={{ min: 1, max: 10 }}
                />
                <IconButton 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                  size="small"
                  sx={{ border: '1px solid #ddd', borderRadius: 1 }}
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/products')}
                sx={{ flex: 1 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!product.is_available}
                sx={{ flex: 1 }}
              >
                Add to Cart
              </Button>
              <Button
                variant="contained"
                size="large"
                color="secondary"
                onClick={handleOrderNow}
                disabled={!product.is_available}
                sx={{ 
                  flex: 1,
                  bgcolor: '#2e7d32', 
                  '&:hover': { bgcolor: '#1b5e20' } 
                }}
              >
                Order Now
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail;