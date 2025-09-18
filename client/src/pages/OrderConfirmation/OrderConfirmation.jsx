import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  ShoppingBag as ShoppingBagIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';

const OrderConfirmation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sample order data - in a real app, this would come from the API or route state
  const order = {
    id: 'ORD-123456',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    items: [
      { id: 1, name: 'Premium Comfort Sneakers', price: 129.99, quantity: 1, image: 'https://via.placeholder.com/80x80?text=Sneakers' },
      { id: 2, name: 'Classic Cotton T-Shirt', price: 24.99, quantity: 2, image: 'https://via.placeholder.com/80x80?text=T-Shirt' },
    ],
    shipping: {
      name: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      email: 'john.doe@example.com',
      phone: '(123) 456-7890',
      method: 'Standard Shipping',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    },
    payment: {
      method: 'Visa ending in 4242',
      cardType: 'visa',
      total: 189.96,
      subtotal: 179.97,
      shipping: 9.99,
      tax: 14.40,
    },
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: 'My Order Confirmation',
        text: `I just placed an order (#${order.id}) on E-Commerce Store!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <CheckCircleIcon 
          sx={{ 
            fontSize: 80, 
            color: 'success.main',
            mb: 2,
          }} 
        />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Thank You for Your Order!
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Your order has been placed successfully.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Order #{order.id} • {order.date}
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/orders"
            startIcon={<ShoppingBagIcon />}
            size={isMobile ? 'medium' : 'large'}
          >
            View Orders
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
            size={isMobile ? 'medium' : 'large'}
          >
            Back to Home
          </Button>
          <Button
            variant="outlined"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            size={isMobile ? 'medium' : 'large'}
          >
            Print Receipt
          </Button>
          <Button
            variant="outlined"
            onClick={handleShare}
            startIcon={<ShareIcon />}
            size={isMobile ? 'medium' : 'large'}
          >
            Share
          </Button>
        </Box>
      </Box>

      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: { xs: 2, md: 4 },
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <ShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
              Shipping Information
            </Typography>
            <Box sx={{ ml: 4 }}>
              <Typography>{order.shipping.name}</Typography>
              <Typography>{order.shipping.address}</Typography>
              <Typography>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</Typography>
              <Typography>{order.shipping.country}</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {order.shipping.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {order.shipping.phone}
                </Typography>
              </Box>
              <Chip 
                label={`Estimated Delivery: ${order.shipping.estimatedDelivery}`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
              Payment Method
            </Typography>
            <Box sx={{ ml: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {order.payment.cardType === 'visa' && (
                  <img 
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" 
                    alt="Visa" 
                    style={{ width: 40, height: 25, marginRight: 10 }}
                  />
                )}
                <Typography>{order.payment.method}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Billing address is the same as shipping address
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ORDER SUMMARY
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">${order.payment.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">${order.payment.shipping.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax</Typography>
                  <Typography variant="body2">${order.payment.tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Total
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    ${order.payment.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Order Details
        </Typography>
        
        <List disablePadding>
          {order.items.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2, px: 0 }}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Avatar
                    variant="rounded"
                    src={item.image}
                    alt={item.name}
                    sx={{ width: 80, height: 80, mr: 2, bgcolor: 'grey.100' }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {item.name}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${item.price.toFixed(2)} each
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
              <Divider component="li" sx={{ my: 1 }} />
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="h6">
            Order Total: <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>${order.payment.total.toFixed(2)}</Box>
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <StorefrontIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          What's Next?
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth="800px" mx="auto" mb={4}>
          We've sent an order confirmation to <strong>{order.shipping.email}</strong> with all the details. 
          You'll receive another email when your order ships.
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
              <EmailIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Email Confirmation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check your email for order confirmation and tracking information.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
              <ShippingIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Track Your Order
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your order status and estimated delivery date.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
              <ShoppingBagIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Continue Shopping
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover more amazing products in our store.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
              <EmailIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Need Help?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact our customer support for any questions about your order.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Button
          variant="contained"
          component={RouterLink}
          to="/"
          size="large"
          sx={{ mt: 6, px: 4, py: 1.5, fontWeight: 600, borderRadius: 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    </Container>
  );
};

// Missing PaymentIcon component
const PaymentIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-1-5h1m4 0h1m-9 5h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3z"
    />
  </svg>
);

export default OrderConfirmation;
