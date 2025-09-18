import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Container,
  InputBase,
  Button,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Category as CategoryIcon,
  Home as HomeIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getCartItemCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const menuId = 'primary-search-account-menu';
  const isMenuOpen = Boolean(anchorEl);

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose} component={Link} to="/account">Profile</MenuItem>
      <MenuItem onClick={handleMenuClose} component={Link} to="/orders">My Orders</MenuItem>
      <Divider />
      <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
    </Menu>
  );

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ width: 250, padding: 2 }}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/products">
          <ListItemIcon><StoreIcon /></ListItemIcon>
          <ListItemText primary="Shop" />
        </ListItem>
        <ListItem button component={Link} to="/categories">
          <ListItemIcon><CategoryIcon /></ListItemIcon>
          <ListItemText primary="Categories" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/wishlist">
          <ListItemIcon><FavoriteBorderIcon /></ListItemIcon>
          <ListItemText primary="Wishlist" />
          <span>{getWishlistCount()}</span>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              mr: 3,
            }}
          >
            StyleHub
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 3 }}>
            <Button
              component={Link}
              to="/products"
              color="inherit"
              sx={{ mx: 1 }}
            >
              Shop
            </Button>
            <Button
              component={Link}
              to="/categories"
              color="inherit"
              sx={{ mx: 1 }}
            >
              Categories
            </Button>
          </Box>

          {/* Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              position: 'relative',
              borderRadius: theme.shape.borderRadius,
              backgroundColor: 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected',
              },
              marginRight: 2,
              marginLeft: { xs: 0, sm: 3 },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                color: 'inherit',
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                width: '100%',
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Icons */}
          <Box sx={{ display: 'flex' }}>
            <IconButton
              size="large"
              aria-label="Wishlist"
              color="inherit"
              component={Link}
              to="/wishlist"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <Badge badgeContent={getWishlistCount()} color="error">
                <FavoriteBorderIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              aria-label="Cart"
              color="inherit"
              component={Link}
              to="/cart"
            >
              <Badge badgeContent={getCartItemCount()} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              edge="end"
              aria-label="Account"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {renderMenu}
    </AppBar>
  );
};

export default Header;
