import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

// Mock data - In a real app, this would come from an API
const mockOrders = [
  {
    id: 'ORD-123456',
    date: '2023-05-15T14:30:00',
    status: 'delivered',
    total: 249.97,
    items: [
      {
        id: 'PROD-001',
        name: 'Wireless Bluetooth Headphones',
        price: 99.99,
        quantity: 1,
        image: '/images/headphones.jpg',
      },
      {
        id: 'PROD-002',
        name: 'Smartphone Stand',
        price: 24.99,
        quantity: 2,
        image: '/images/stand.jpg',
      },
    ],
    shipping: {
      name: 'John Doe',
      address: '123 Main St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      trackingNumber: '1Z999AA1234567890',
      carrier: 'UPS',
    },
    payment: {
      method: 'visa',
      last4: '4242',
      amount: 274.97,
      subtotal: 249.97,
      shipping: 9.99,
      tax: 25.01,
      discount: 10.00,
    },
  },
  {
    id: 'ORD-123455',
    date: '2023-04-28T09:15:00',
    status: 'shipped',
    total: 89.99,
    items: [
      {
        id: 'PROD-003',
        name: 'Wireless Charging Pad',
        price: 29.99,
        quantity: 3,
        image: '/images/charger.jpg',
      },
    ],
    shipping: {
      name: 'John Doe',
      address: '123 Main St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      trackingNumber: '1Z999BB9876543210',
      carrier: 'FedEx',
    },
    payment: {
      method: 'mastercard',
      last4: '5555',
      amount: 97.49,
      subtotal: 89.99,
      shipping: 7.50,
      tax: 9.00,
      discount: 0,
    },
  },
];

const statusConfig = {
  processing: { label: 'Processing', color: 'info' },
  shipped: { label: 'Shipped', color: 'warning' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

const paymentMethodIcons = {
  visa: '/images/visa.png',
  mastercard: '/images/mastercard.png',
  amex: '/images/amex.png',
  paypal: '/images/paypal.png',
};

export default function Orders() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch orders from an API
    const fetchOrders = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOrderClick = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
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
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Account
        </Button>
        <Box display="flex" alignItems="center" mb={3}>
          <ShoppingBagIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            My Orders
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          View and track your order history
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
          }}
        >
          <ShoppingBagIcon
            color="disabled"
            sx={{ fontSize: 64, mb: 2, opacity: 0.5 }}
          />
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't placed any orders yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell>{order.items.length} item(s)</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusConfig[order.status]?.label || order.status}
                            color={statusConfig[order.status]?.color || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderClick(order.id);
                            }}
                          >
                            {expandedOrder === order.id ? 'Hide' : 'View'} Details
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={6}
                        >
                          <Accordion
                            expanded={expandedOrder === order.id}
                            elevation={0}
                            sx={{
                              backgroundColor: 'transparent',
                              '&:before': {
                                display: 'none',
                              },
                            }}
                          >
                            <AccordionSummary
                              style={{ display: 'none' }}
                              expandIcon={<ExpandMoreIcon />}
                            />
                            <AccordionDetails>
                              <Box sx={{ p: 2 }}>
                                <Grid container spacing={4}>
                                  <Grid item xs={12} md={8}>
                                    <Typography variant="h6" gutterBottom>
                                      Order Items
                                    </Typography>
                                    <List>
                                      {order.items.map((item) => (
                                        <ListItem
                                          key={item.id}
                                          divider
                                          sx={{ py: 2 }}
                                        >
                                          <ListItemAvatar>
                                            <Avatar
                                              src={item.image}
                                              alt={item.name}
                                              variant="rounded"
                                              sx={{
                                                width: 64,
                                                height: 64,
                                                mr: 2,
                                              }}
                                            />
                                          </ListItemAvatar>
                                          <ListItemText
                                            primary={
                                              <Typography
                                                variant="subtitle1"
                                                sx={{ fontWeight: 500 }}
                                              >
                                                {item.name}
                                              </Typography>
                                            }
                                            secondary={
                                              <>
                                                <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                >
                                                  Qty: {item.quantity}
                                                </Typography>
                                                <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                >
                                                  ${item.price.toFixed(2)} each
                                                </Typography>
                                              </>
                                            }
                                          />
                                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                          </Typography>
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 3,
                                        backgroundColor:
                                          theme.palette.mode === 'light'
                                            ? theme.palette.grey[50]
                                            : theme.palette.grey[900],
                                        borderRadius: 2,
                                      }}
                                    >
                                      <Typography variant="h6" gutterBottom>
                                        Order Summary
                                      </Typography>
                                      <Box sx={{ mb: 2 }}>
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          mb={1}
                                        >
                                          <Typography variant="body2" color="text.secondary">
                                            Subtotal
                                          </Typography>
                                          <Typography variant="body2">
                                            ${order.payment.subtotal.toFixed(2)}
                                          </Typography>
                                        </Box>
                                        {order.payment.discount > 0 && (
                                          <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            mb={1}
                                          >
                                            <Typography variant="body2" color="text.secondary">
                                              Discount
                                            </Typography>
                                            <Typography variant="body2" color="success.main">
                                              -${order.payment.discount.toFixed(2)}
                                            </Typography>
                                          </Box>
                                        )}
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          mb={1}
                                        >
                                          <Typography variant="body2" color="text.secondary">
                                            Shipping
                                          </Typography>
                                          <Typography variant="body2">
                                            ${order.payment.shipping.toFixed(2)}
                                          </Typography>
                                        </Box>
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          mb={2}
                                        >
                                          <Typography variant="body2" color="text.secondary">
                                            Tax
                                          </Typography>
                                          <Typography variant="body2">
                                            ${order.payment.tax.toFixed(2)}
                                          </Typography>
                                        </Box>
                                        <Divider sx={{ my: 2 }} />
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          mb={2}
                                        >
                                          <Typography variant="subtitle1" fontWeight="bold">
                                            Total
                                          </Typography>
                                          <Typography variant="subtitle1" fontWeight="bold">
                                            ${order.payment.amount.toFixed(2)}
                                          </Typography>
                                        </Box>
                                      </Box>

                                      <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Payment Method
                                        </Typography>
                                        <Box
                                          display="flex"
                                          alignItems="center"
                                          sx={{ mt: 1 }}
                                        >
                                          <Box
                                            component="img"
                                            src={
                                              paymentMethodIcons[order.payment.method] ||
                                              paymentMethodIcons.visa
                                            }
                                            alt={order.payment.method}
                                            sx={{
                                              width: 40,
                                              height: 25,
                                              objectFit: 'contain',
                                              mr: 1,
                                            }}
                                          />
                                          <Typography variant="body2">
                                            **** **** **** {order.payment.last4}
                                          </Typography>
                                        </Box>
                                      </Box>

                                      <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Shipping Address
                                        </Typography>
                                        <Typography variant="body2">
                                          {order.shipping.name}
                                          <br />
                                          {order.shipping.address}
                                          <br />
                                          {order.shipping.city}, {order.shipping.state}{' '}
                                          {order.shipping.zip}
                                          <br />
                                          {order.shipping.country}
                                        </Typography>
                                      </Box>

                                      {order.status === 'shipped' && (
                                        <Box sx={{ mb: 3 }}>
                                          <Typography variant="subtitle2" gutterBottom>
                                            Tracking Information
                                          </Typography>
                                          <Box
                                            display="flex"
                                            alignItems="center"
                                            sx={{ mt: 1 }}
                                          >
                                            <ShippingIcon
                                              color="primary"
                                              sx={{ mr: 1 }}
                                            />
                                            <Box>
                                              <Typography variant="body2">
                                                {order.shipping.carrier} • {order.shipping.trackingNumber}
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                color="primary"
                                                sx={{ mt: 0.5, cursor: 'pointer' }}
                                              >
                                                Track Order
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                      )}

                                      {order.status === 'delivered' && (
                                        <Box
                                          sx={{
                                            backgroundColor: 'success.light',
                                            color: 'success.dark',
                                            p: 2,
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                          }}
                                        >
                                          <CheckCircleIcon sx={{ mr: 1 }} />
                                          <Typography variant="body2">
                                            Delivered on {formatDate(order.date)}
                                          </Typography>
                                        </Box>
                                      )}

                                      <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => {
                                          // Handle reorder
                                        }}
                                        sx={{ mb: 1 }}
                                      >
                                        Reorder
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => {
                                          // Handle return
                                        }}
                                      >
                                        Return Items
                                      </Button>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Container>
  );
}
