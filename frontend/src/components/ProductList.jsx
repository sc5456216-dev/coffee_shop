import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Grid, Card, CardContent, CardMedia, Typography, Button, Box, Pagination,
  TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Chip, Alert, Snackbar,
  IconButton, InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const ProductList = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0, next: null, previous: null, currentPage: 1, pageSize: 12,
  });
  
  // ✅ FIXED: Keep 'search' in a temporary state for typing
  const [searchInput, setSearchInput] = useState('');
  
  // ✅ FIXED: 'search' in filters is only updated when user clicks Search or presses Enter
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    ordering: 'name',
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        ...filters,
      };
      const data = await productService.getProducts(params);
      
      if (data.results) {
        setProducts(data.results);
        setPagination({ ...pagination, count: data.count, next: data.next, previous: data.previous });
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, currentPage: value });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  // ✅ FIXED: Only update filter when Enter is pressed or Search button clicked
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleAddToCart = (product) => {
    if (!product) return;
    const item = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      image: product.image,
      slug: product.slug,
    };
    addToCart(item);
    setSnackbar({ open: true, message: `${product.name} added to cart!`, severity: 'success' });
  };

  const handleViewProduct = (product) => {
    if (product.slug) navigate(`/product/${product.slug}`);
    else if (product.id) navigate(`/product/${product.id}`);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="lg" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>Our Coffee Selection</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            {/* ✅ FIXED: Search bar that only fires on Enter or Search button */}
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Search by Full Name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" edge="end" aria-label="search">
                        <Search />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} label="Category">
                <MenuItem value="">All Categories</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select value={filters.ordering} onChange={(e) => handleFilterChange('ordering', e.target.value)} label="Sort By">
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price">Price: Low to High</MenuItem>
                <MenuItem value="-price">Price: High to Low</MenuItem>
                <MenuItem value="-created_at">Newest</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {products.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">No products found</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer', '&:hover': { transform: 'scale(1.02)', boxShadow: 6 } }} onClick={() => handleViewProduct(product)}>
                <CardMedia component="img" height="200" image={product.image || 'https://via.placeholder.com/300x200?text=Coffee'} alt={product.name} sx={{ objectFit: 'cover' }} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2" noWrap>{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>{product.description}</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">${parseFloat(product.price).toFixed(2)}</Typography>
                    <Chip label={product.is_available ? 'In Stock' : 'Out of Stock'} color={product.is_available ? 'success' : 'error'} size="small" />
                  </Box>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }} disabled={!product.is_available} onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}>
                    {product.is_available ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {pagination.count > pagination.pageSize && (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <Pagination count={Math.ceil(pagination.count / pagination.pageSize)} page={pagination.currentPage} onChange={handlePageChange} color="primary" size="large" />
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductList;