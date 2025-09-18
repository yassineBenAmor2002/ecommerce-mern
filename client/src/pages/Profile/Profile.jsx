import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  ShoppingBag as OrdersIcon,
  Favorite as WishlistIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

// Mock data
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  memberSince: 'January 2023',
  defaultAddress: {
    type: 'home',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  },
  paymentMethods: [
    { id: 'card1', type: 'visa', last4: '4242', expiry: '12/25', isDefault: true },
  ],
  orders: [
    { id: 'ORD-123456', date: '2023-10-15', status: 'delivered', total: 129.99 },
    { id: 'ORD-789012', date: '2023-09-28', status: 'shipped', total: 119.96 },
  ],
  wishlist: [
    { id: 1, name: 'Wireless Headphones', price: 99.99 },
    { id: 2, name: 'Smart Watch', price: 199.99 },
  ],
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEditMode(false);
    // In a real app, save to API
  };

  const getOrderStatus = (status) => {
    switch (status) {
      case 'delivered':
        return <Chip label="Delivered" color="success" size="small" variant="outlined" />;
      case 'shipped':
        return <Chip label="Shipped" color="primary" size="small" variant="outlined" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      
      {/* Profile Header */}
      <Paper elevation={0} variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
          <Avatar
            src={userData.avatar}
            alt={`${userData.firstName} ${userData.lastName}`}
            sx={{ width: 120, height: 120, mb: isMobile ? 2 : 0, mr: isMobile ? 0 : 4 }}
          />
          
          <Box sx={{ textAlign: isMobile ? 'center' : 'left', mt: isMobile ? 2 : 0 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {userData.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {userData.memberSince}
            </Typography>
            
            {!editMode && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 4 }}>
        {/* Sidebar */}
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 3, 
            width: isMobile ? '100%' : 280,
            height: 'fit-content',
            position: isMobile ? 'static' : 'sticky',
            top: 100,
          }}
        >
          <List>
            <ListItem button selected={tabValue === 0} onClick={() => setTabValue(0)}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            
            <ListItem button selected={tabValue === 1} onClick={() => setTabValue(1)}>
              <ListItemIcon><OrdersIcon /></ListItemIcon>
              <ListItemText primary="My Orders" />
              <Chip label={userData.orders.length} size="small" />
            </ListItem>
            
            <ListItem button selected={tabValue === 2} onClick={() => setTabValue(2)}>
              <ListItemIcon><WishlistIcon /></ListItemIcon>
              <ListItemText primary="Wishlist" />
              <Chip label={userData.wishlist.length} size="small" />
            </ListItem>
            
            <ListItem button selected={tabValue === 3} onClick={() => setTabValue(3)}>
              <ListItemIcon><LocationIcon /></ListItemIcon>
              <ListItemText primary="Addresses" />
            </ListItem>
            
            <ListItem button selected={tabValue === 4} onClick={() => setTabValue(4)}>
              <ListItemIcon><PaymentIcon /></ListItemIcon>
              <ListItemText primary="Payment Methods" />
            </ListItem>
            
            <Divider sx={{ my: 2 }} />
            
            <ListItem button onClick={() => navigate('/change-password')}>
              <ListItemIcon><LockIcon /></ListItemIcon>
              <ListItemText primary="Change Password" />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/login')} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Paper>
        
        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Profile" />
              <Tab label={`Orders (${userData.orders.length})`} />
              <Tab label={`Wishlist (${userData.wishlist.length})`} />
              <Tab label="Addresses" />
              <Tab label="Payment Methods" />
            </Tabs>
            
            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      margin="normal"
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      margin="normal"
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      margin="normal"
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      margin="normal"
                      disabled={!editMode}
                    />
                  </Grid>
                  
                  {editMode && (
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ mr: 2 }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </TabPanel>
            
            {/* Orders Tab */}
            <TabPanel value={tabValue} index={1}>
              {userData.orders.map((order) => (
                <Paper key={order.id} elevation={0} variant="outlined" sx={{ p: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <div>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.date).toLocaleDateString()}
                      </Typography>
                    </div>
                    {getOrderStatus(order.status)}
                  </Box>
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    ${order.total.toFixed(2)}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    View Details
                  </Button>
                </Paper>
              ))}
            </TabPanel>
            
            {/* Wishlist Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {userData.wishlist.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Add to Cart
                      </Button>
                      <IconButton sx={{ mt: 1 }} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            
            {/* Addresses Tab */}
            <TabPanel value={tabValue} index={3}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {userData.defaultAddress.type === 'home' ? 'Home' : 'Work'}
                  </Typography>
                  <Box>
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography>
                  {userData.defaultAddress.street}<br />
                  {userData.defaultAddress.city}, {userData.defaultAddress.state} {userData.defaultAddress.zipCode}<br />
                  {userData.defaultAddress.country}
                </Typography>
                <Chip 
                  label="Default" 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                />
              </Paper>
              
              <Button variant="outlined" startIcon={<AddIcon />}>
                Add New Address
              </Button>
            </TabPanel>
            
            {/* Payment Methods Tab */}
            <TabPanel value={tabValue} index={4}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" 
                      alt="Visa" 
                      style={{ width: 40, height: 25, marginRight: 12 }} 
                    />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Visa ending in {userData.paymentMethods[0].last4}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Expires {userData.paymentMethods[0].expiry}
                </Typography>
                <Chip 
                  label="Default" 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                />
              </Paper>
              
              <Button variant="outlined" startIcon={<AddIcon />}>
                Add Payment Method
              </Button>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Profile;
