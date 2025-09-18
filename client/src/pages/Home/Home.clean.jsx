import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActionArea,
  CardActions, 
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Rating,
  IconButton,
  Skeleton
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { getFeaturedProducts } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedProducts(8);
        if (data.success) {
          setFeaturedProducts(data.data);
        } else {
          setError(data.message || 'Failed to load featured products');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart({ ...product, quantity: 1 });
  };

  const handleWishlistToggle = (productId, e) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <CardContent>
                  <Skeleton />
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 12,
          mb: 8,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant={isMobile ? 'h4' : 'h2'} 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Welcome to StyleHub
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            paragraph
            sx={{
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Discover amazing products at the best prices
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/products')}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '50px',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
                transition: 'all 0.3s ease'
              }}
            >
              Shop Now
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              onClick={() => navigate('/products?category=featured')}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '50px',
                borderWidth: '2px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: '2px',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Featured Items
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="xl" sx={{ mb: 10, py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 700,
              mb: 2,
              position: 'relative',
              display: 'inline-block',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                backgroundColor: 'primary.main',
                borderRadius: 2
              }
            }}
          >
            Featured Products
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Handpicked items just for you
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  },
                }}
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Wishlist Button */}
                <IconButton
                  aria-label="add to wishlist"
                  onClick={(e) => handleWishlistToggle(product._id, e)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'background.paper',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: 1,
                  }}
                >
                  {wishlist.includes(product._id) ? (
                    <Favorite color="error" />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>

                {/* Product Image */}
                <CardActionArea 
                  onClick={() => handleProductClick(product._id)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Box sx={{ 
                    width: '100%', 
                    pt: '100%', 
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px 8px 0 0'
                  }}>
                    <Box
                      component="img"
                      src={product.images?.[0] || '/images/placeholder.jpg'}
                      alt={product.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        transform: hoveredProduct === product._id ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />
                    {product.discount > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          backgroundColor: 'error.main',
                          color: 'white',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          zIndex: 1,
                        }}
                      >
                        -{product.discount}%
                      </Box>
                    )}
                  </Box>

                  {/* Product Info */}
                  <CardContent sx={{ width: '100%', p: 2, flexGrow: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      component="h3" 
                      noWrap 
                      sx={{ 
                        fontWeight: 600,
                        mb: 0.5,
                        color: 'text.primary'
                      }}
                    >
                      {product.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.8em'
                      }}
                    >
                      {product.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={product.rating || 0} 
                        precision={0.5} 
                        readOnly 
                        size="small" 
                      />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ ml: 0.5, fontSize: '0.75rem' }}
                      >
                        ({product.numReviews || 0})
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'primary.main'
                        }}
                      >
                        ${product.discount > 0 
                          ? (product.price * (1 - product.discount / 100)).toFixed(2)
                          : product.price.toFixed(2)
                        }
                      </Typography>
                      
                      {product.discount > 0 && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            textDecoration: 'line-through',
                            color: 'text.disabled',
                            fontSize: '0.875rem'
                          }}
                        >
                          ${product.price.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>

                {/* Quick Add to Cart Button - Shows on hover */}
                <Box 
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    backgroundColor: 'background.paper',
                    transform: hoveredProduct === product._id ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
                    zIndex: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '0 0 8px 8px'
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddShoppingCart />}
                    onClick={(e) => handleAddToCart(product, e)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2,
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box mt={8} textAlign="center">
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            onClick={() => navigate('/products')}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '50px',
              textTransform: 'none',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
              transition: 'all 0.3s ease'
            }}
          >
            View All Products
          </Button>
        </Box>
      </Container>
      
      {/* Categories Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, mb: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  backgroundColor: 'primary.main',
                  borderRadius: 2
                }
              }}
            >
              Shop by Category
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Browse our wide range of categories
            </Typography>
          </Box>
          
          <Grid container spacing={3} justifyContent="center">
            {[
              { name: 'Electronics', image: '/images/categories/electronics.jpg' },
              { name: 'Fashion', image: '/images/categories/fashion.jpg' },
              { name: 'Home & Living', image: '/images/categories/home.jpg' },
              { name: 'Beauty', image: '/images/categories/beauty.jpg' },
            ].map((category, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card 
                  onClick={() => navigate(`/products?category=${category.name.toLowerCase()}`)}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      '& .category-overlay': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      },
                      '& .category-name': {
                        transform: 'translateY(0)',
                      }
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      paddingTop: '100%',
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={category.image}
                    alt={category.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box 
                    className="category-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      className="category-name"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        transform: 'translateY(10px)',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Why Choose Our Store?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
                We provide the best shopping experience with high-quality products, fast delivery, and excellent customer service.
              </Typography>
              
              <Grid container spacing={3}>
                {[
                  { 
                    icon: '🚚', 
                    title: 'Free Shipping', 
                    description: 'On all orders over $50' 
                  },
                  { 
                    icon: '💳', 
                    title: 'Secure Payment', 
                    description: '100% secure payment processing' 
                  },
                  { 
                    icon: '↩️', 
                    title: 'Easy Returns', 
                    description: '30-day return policy' 
                  },
                  { 
                    icon: '📞', 
                    title: '24/7 Support', 
                    description: 'Dedicated support' 
                  },
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box 
                      sx={{
                        p: 2,
                        height: '100%',
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                        },
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box 
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          '&:hover': {
                            transform: 'rotate(10deg)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Typography variant="h4">
                          {feature.icon}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: 3,
                '&:before': {
                  content: '""',
                  display: 'block',
                  paddingTop: '100%',
                },
                '& img': {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }
              }}
            >
              <img 
                src="/images/featured-image.jpg" 
                alt="Featured Product" 
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
