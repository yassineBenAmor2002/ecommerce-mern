import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Divider,
  Tabs,
  Tab,
  Rating,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  Avatar,
  TextField,
} from '@mui/material';
import {
  AddShoppingCart,
  FavoriteBorder,
  Share,
  ArrowBack,
  CheckCircle,
  LocalShipping,
  Security,
  Replay,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Sample product data - in a real app, this would come from an API
const sampleProduct = {
  id: 1,
  name: 'Premium Comfort Sneakers',
  price: 129.99,
  originalPrice: 159.99,
  description: 'Experience ultimate comfort with our premium sneakers. Made with high-quality materials and designed for all-day wear.',
  rating: 4.7,
  reviewCount: 128,
  inStock: true,
  colors: ['#000000', '#2E3B55', '#8B0000', '#556B2F'],
  sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
  features: [
    'Breathable mesh upper',
    'Cushioned insole for all-day comfort',
    'Durable rubber outsole',
    'Lightweight design',
    'Machine washable'
  ],
  details: 'These sneakers are designed with the latest technology to provide maximum comfort and style. The breathable mesh upper keeps your feet cool, while the cushioned insole provides support for all-day wear. The durable rubber outsole ensures long-lasting performance, and the lightweight design makes them perfect for any activity.',
  images: [
    'https://via.placeholder.com/800x800?text=Product+1',
    'https://via.placeholder.com/800x800?text=Product+2',
    'https://via.placeholder.com/800x800?text=Product+3',
    'https://via.placeholder.com/800x800?text=Product+4',
  ],
  relatedProducts: Array(4).fill().map((_, i) => ({
    id: i + 2,
    name: `Related Product ${i + 1}`,
    price: Math.floor(Math.random() * 100) + 50,
    image: `https://via.placeholder.com/300x400?text=Related+${i + 1}`,
    rating: (Math.random() * 1 + 4).toFixed(1),
  })),
};

const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: 'transparent',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 'auto',
    padding: '12px 16px',
    '&.Mui-selected': {
      color: 'primary.main',
      fontWeight: 600,
    },
  },
});

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(2); // Default to US 9
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchProduct = async () => {
      try {
        // In a real app, you would fetch the product data using the id
        // const response = await fetch(`/api/products/${id}`);
        // const data = await response.json();
        // setProduct(data);
        
        // For demo purposes, we're using sample data
        setProduct(sampleProduct);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', {
      productId: product.id,
      name: product.name,
      price: product.price,
      color: product.colors[selectedColor],
      size: product.sizes[selectedSize],
      quantity,
      image: product.images[0],
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading product details...</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Product not found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Home
        </MuiLink>
        <MuiLink
          component="button"
          variant="body2"
          onClick={() => navigate('/products')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Products
        </MuiLink>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            {product.originalPrice > product.price && (
              <Chip
                label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
                color="error"
                size="medium"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 1,
                  fontWeight: 'bold',
                }}
              />
            )}
            
            <Box
              component="img"
              src={product.images[selectedImage]}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                objectFit: 'cover',
                aspectRatio: '1/1',
                backgroundColor: theme.palette.grey[100],
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', py: 1 }}>
              {product.images.map((img, index) => (
                <Box
                  key={index}
                  component="img"
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                    opacity: selectedImage === index ? 1 : 0.7,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} precision={0.1} readOnly sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {product.rating} ({product.reviewCount} reviews)
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                  ${product.price.toFixed(2)}
                </Typography>
                {product.originalPrice > product.price && (
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ${product.originalPrice.toFixed(2)}
                  </Typography>
                )}
              </Box>
              {product.originalPrice > product.price && (
                <Typography variant="body2" color="error">
                  Save ${(product.originalPrice - product.price).toFixed(2)} ({Math.round((1 - product.price / product.originalPrice) * 100)}%)
                </Typography>
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
          </Box>

          {/* Color Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Color: <span style={{ color: product.colors[selectedColor] }}>Color {selectedColor + 1}</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {product.colors.map((color, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: selectedColor === index 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : '2px solid transparent',
                    boxShadow: selectedColor === index ? `0 0 0 2px ${theme.palette.background.paper}` : 'none',
                    '&:hover': {
                      opacity: 0.9,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Size Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Size: {product.sizes[selectedSize]}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {product.sizes.map((size, index) => (
                <Button
                  key={index}
                  variant={selectedSize === index ? 'contained' : 'outlined'}
                  onClick={() => setSelectedSize(index)}
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    py: 1,
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: selectedSize === index ? theme.palette.primary.main : 'transparent',
                    },
                  }}
                >
                  {size}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Quantity & Actions */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography variant="subtitle2" sx={{ mr: 2, fontWeight: 600 }}>
                Quantity:
              </Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1, max: 10 }}
                size="small"
                sx={{ width: 80, '& .MuiOutlinedInput-input': { textAlign: 'center' } }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCart />}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                sx={{ flex: isMobile ? '1 1 100%' : 'none' }}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                size="large"
                color="primary"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                sx={{ flex: isMobile ? '1 1 100%' : 'none' }}
              >
                Buy Now
              </Button>
              <IconButton
                color={isWishlisted ? 'error' : 'default'}
                onClick={() => setIsWishlisted(!isWishlisted)}
                sx={{ border: `1px solid ${theme.palette.divider}` }}
              >
                <FavoriteBorder />
              </IconButton>
              <IconButton sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Share />
              </IconButton>
            </Box>
          </Box>

          {/* Product Features */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <LocalShipping fontSize="small" color="primary" />
              <Typography variant="body2">
                <strong>Free Shipping</strong> on orders over $50
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Replay fontSize="small" color="primary" />
              <Typography variant="body2">
                <strong>30-Day Returns</strong> - No questions asked
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Product Tabs */}
      <Box sx={{ width: '100%', mt: 6, mb: 4 }}>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="product tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Description" />
          <Tab label={`Reviews (${product.reviewCount})`} />
          <Tab label="Shipping & Returns" />
          <Tab label="Size Guide" />
        </StyledTabs>
        <Divider />
        
        <Box sx={{ py: 4 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Product Details
              </Typography>
              <Typography paragraph>{product.details}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                Key Features
              </Typography>
              <ul style={{ paddingLeft: 24, margin: '16px 0' }}>
                {product.features.map((feature, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>{feature}</li>
                ))}
              </ul>
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Customer Reviews
              </Typography>
              <Typography color="text.secondary">
                No reviews yet. Be the first to review this product!
              </Typography>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Shipping Information
              </Typography>
              <Typography paragraph>
                We offer free standard shipping on all orders over $50. Orders are typically processed within 1-2 business days and delivered within 3-5 business days.
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                Returns & Exchanges
              </Typography>
              <Typography paragraph>
                We offer a 30-day return policy. Items must be in their original condition with all tags attached. Please contact our customer service team to initiate a return.
              </Typography>
            </Box>
          )}
          
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Size Guide
              </Typography>
              <Typography paragraph>
                Our shoes typically fit true to size. If you're unsure about your size, please refer to the size chart below or contact our customer service team for assistance.
              </Typography>
              {/* Size chart would go here */}
            </Box>
          )}
        </Box>
      </Box>

      {/* Related Products */}
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          You May Also Like
        </Typography>
        <Grid container spacing={3}>
          {product.relatedProducts.map((item) => (
            <Grid item xs={6} sm={4} md={3} key={item.id}>
              <Box 
                sx={{ 
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover .product-overlay': {
                    opacity: 1,
                  },
                }}
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <Box
                  component="img"
                  src={item.image}
                  alt={item.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1,
                    aspectRatio: '3/4',
                    objectFit: 'cover',
                    backgroundColor: theme.palette.grey[100],
                    mb: 1,
                  }}
                />
                <Box
                  className="product-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <Button variant="contained" size="small">
                    View Details
                  </Button>
                </Box>
                <Typography variant="subtitle2" noWrap>{item.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={parseFloat(item.rating)} size="small" readOnly precision={0.5} />
                  <Typography variant="caption" color="text.secondary">
                    ({Math.floor(Math.random() * 100)})
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  ${item.price.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductDetails;
