import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Divider,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  LocalShipping,
  Discount,
  ArrowBack,
} from '@mui/icons-material';

// Sample cart data - in a real app, this would come from a cart context or Redux store
const initialCartItems = [
  {
    id: 1,
    name: 'Premium Comfort Sneakers',
    price: 129.99,
    image: 'https://via.placeholder.com/100x100?text=Sneakers',
    color: 'Black',
    size: 'US 9',
    quantity: 1,
    inStock: true,
  },
  {
    id: 2,
    name: 'Classic Cotton T-Shirt',
    price: 24.99,
    image: 'https://via.placeholder.com/100x100?text=T-Shirt',
    color: 'White',
    size: 'M',
    quantity: 2,
    inStock: true,
  },
  {
    id: 3,
    name: 'Wireless Earbuds',
    price: 79.99,
    image: 'https://via.placeholder.com/100x100?text=Earbuds',
    color: 'Black',
    size: 'One Size',
    quantity: 1,
    inStock: true,
  },
];

const Cart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const applyCoupon = (e) => {
    e.preventDefault();
    // In a real app, you would validate the coupon code with your backend
    alert(`Coupon code "${couponCode}" applied!`);
    setCouponCode('');
  };

  const proceedToCheckout = () => {
    // In a real app, you would redirect to the checkout page
    navigate('/checkout');
  };

  const continueShopping = () => {
    navigate('/products');
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <LocalShipping sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" paragraph>
          Looks like you haven't added anything to your cart yet.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={continueShopping}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} lg={8}>
          {isMobile ? (
            // Mobile view
            <Box>
              {cartItems.map((item) => (
                <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 1,
                        backgroundColor: theme.palette.grey[100],
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.color} / {item.size}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => removeItem(item.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body1" sx={{ px: 1, minWidth: 32, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            // Desktop view
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                              backgroundColor: theme.palette.grey[100],
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.color} / {item.size}
                            </Typography>
                            {!item.inStock && (
                              <Typography variant="caption" color="error">
                                Out of stock
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography>${item.price.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1, minWidth: 32, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={() => removeItem(item.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Cart Actions */}
          <Box sx={{ mt: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/products"
              startIcon={<ArrowBack />}
              sx={{ alignSelf: 'flex-start' }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              onClick={() => setCartItems([])}
              sx={{ ml: 'auto' }}
            >
              Clear Cart
            </Button>
          </Box>

          {/* Coupon & Gift Options */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  <Discount sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Apply Coupon Code
                </Typography>
                <form onSubmit={applyCoupon}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Discount color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button 
                      type="submit" 
                      variant="outlined"
                      disabled={!couponCode.trim()}
                    >
                      Apply
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Gift Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="This order contains a gift"
                />
                {isGift && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a gift message (optional)"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Tax</Typography>
                <Typography>${tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
              {shipping === 0 ? (
                <Typography variant="body2" color="success.main" sx={{ mb: 2, textAlign: 'center' }}>
                  🎉 You've got free shipping!
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Spend ${(50 - subtotal).toFixed(2)} more to get free shipping!
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={proceedToCheckout}
              disabled={cartItems.length === 0}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Proceed to Checkout
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              or{' '}
              <Button
                component={RouterLink}
                to="/checkout"
                size="small"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Checkout with PayPal
              </Button>
            </Typography>
          </Paper>

          {/* Secure Checkout Info */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              <Security fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Secure Checkout
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Your payment information is encrypted and secure. We don't store your credit card details.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
