import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  AddShoppingCart,
  Favorite,
  RemoveShoppingCart,
  ArrowBack,
} from '@mui/icons-material';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export default function Wishlist() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, getWishlistItems } = useWishlist();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch the actual product details here
        // For now, we'll use the product IDs directly
        const wishlistItems = getWishlistItems();
        setProducts(wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, [wishlist, getWishlistItems]);

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(product.id);
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wishlist
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {products.length} {products.length === 1 ? 'item' : 'items'} in your wishlist
        </Typography>
      </Box>

      {products.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          textAlign="center"
        >
          <Favorite
            color="disabled"
            sx={{ fontSize: 80, mb: 2, opacity: 0.5 }}
          />
          <Typography variant="h5" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't added any items to your wishlist yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Box sx={{ position: 'relative', pt: '100%' }}>
                  <CardMedia
                    component="img"
                    image={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    aria-label="remove from wishlist"
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'background.paper',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Favorite color="error" />
                  </IconButton>
                  {product.discount > 0 && (
                    <Chip
                      label={`-${product.discount}%`}
                      color="error"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    component={Link}
                    to={`/products/${product.id}`}
                    sx={{
                      fontWeight: 500,
                      textDecoration: 'none',
                      color: 'inherit',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1,
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: 'bold', mr: 1 }}
                    >
                      ${product.price.toFixed(2)}
                    </Typography>
                    {product.originalPrice && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        ${product.originalPrice.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <Box
                        component="span"
                        sx={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: product.inStock ? 'success.main' : 'error.main',
                          mr: 1,
                        }}
                      />
                      <Typography variant="caption">
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<AddShoppingCart />}
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product)}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
