import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Menu, MenuItem,
  Container, Avatar, Tooltip, Divider, useMediaQuery, useTheme, Drawer, List,
  ListItem, ListItemIcon, ListItemText, ListItemButton,
} from '@mui/material';
import {
  ShoppingCart, Person, Menu as MenuIcon, Dashboard, Logout, Login,
  PersonAdd, Coffee, Home, ListAlt, Settings, Close, Storefront,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { apiHelpers } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { itemCount } = useCart();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authenticated = apiHelpers.isAuthenticated(); // Fixed: Calling the method
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const userData = apiHelpers.getCurrentUser(); // Fixed: Calling the method
      setUser(userData);
    } else {
      setUser(null);
    }
  };

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    apiHelpers.clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    handleClose();
    setMobileOpen(false);
    navigate('/');
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // ✅ ADDED: 'Shop' link with Storefront icon
  const navItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Shop', path: '/shop', icon: <Storefront /> },
  ];

  const authItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'My Orders', path: '/orders', icon: <ListAlt /> },
    { label: 'Profile', path: '/profile', icon: <Settings /> },
  ];

  const drawerContent = (
    <Box sx={{ width: 280, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6F4E37' }}>☕ Coffee Shop</Typography>
        <IconButton onClick={handleDrawerToggle}><Close /></IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={Link} to={item.path} onClick={handleDrawerToggle}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {isAuthenticated ? (
          <>
            <Divider />
            {authItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={Link} to={item.path} onClick={handleDrawerToggle}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><Logout sx={{ color: 'error.main' }} /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" onClick={handleDrawerToggle}>
                <ListItemIcon><Login /></ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/register" onClick={handleDrawerToggle}>
                <ListItemIcon><PersonAdd /></ListItemIcon>
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#6F4E37', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Coffee sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Coffee Shop
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {navItems.map((item) => (
                <Button key={item.path} color="inherit" component={Link} to={item.path} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }, borderRadius: 2 }}>
                  {item.label}
                </Button>
              ))}
              <IconButton color="inherit" component={Link} to="/cart" sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }, ml: 1 }}>
                <Badge badgeContent={itemCount} color="error" max={99}>
                  <ShoppingCart />
                </Badge>
              </IconButton>
              {isAuthenticated ? (
                <Box>
                  <Tooltip title="Account settings">
                    <IconButton onClick={handleMenu} color="inherit" size="small" sx={{ ml: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#D4A574', color: '#6F4E37', fontWeight: 'bold', fontSize: '14px' }}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} PaperProps={{ sx: { mt: 1, minWidth: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 } }}>
                    <MenuItem disabled sx={{ py: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{user?.username || 'User'}</Typography>
                        <Typography variant="caption" color="text.secondary">{user?.email || ''}</Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem component={Link} to="/shop" onClick={handleClose}><Storefront sx={{ mr: 1, fontSize: 20 }} /> Shop</MenuItem>
                    <MenuItem component={Link} to="/profile" onClick={handleClose}><Person sx={{ mr: 1, fontSize: 20 }} /> Profile</MenuItem>
                    <MenuItem component={Link} to="/orders" onClick={handleClose}><ListAlt sx={{ mr: 1, fontSize: 20 }} /> My Orders</MenuItem>
                    <MenuItem component={Link} to="/dashboard" onClick={handleClose}><Dashboard sx={{ mr: 1, fontSize: 20 }} /> Dashboard</MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><Logout sx={{ mr: 1, fontSize: 20 }} /> Logout</MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                  <Button color="inherit" component={Link} to="/login" sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }, borderRadius: 2 }}>Login</Button>
                  <Button variant="contained" component={Link} to="/register" sx={{ bgcolor: 'white', color: '#6F4E37', '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.02)' }, borderRadius: 2, transition: 'all 0.2s' }}>Register</Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, backgroundColor: '#fafafa' } }}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;