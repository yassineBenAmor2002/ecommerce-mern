import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  Paper,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  InputAdornment,
  useTheme,
  useMediaQuery,
  IconButton,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  ArrowBack,
  CreditCard,
  AccountBalance,
  LocalAtm,
  Lock,
  CalendarToday,
  Payment,
  LockOutlined,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Sample cart data
const cartItems = [
  { id: 1, name: 'Premium Comfort Sneakers', price: 129.99, quantity: 1 },
  { id: 2, name: 'Classic Cotton T-Shirt', price: 24.99, quantity: 2 },
];

const steps = ['Shipping', 'Payment', 'Review & Place Order'];

const Checkout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [saveInfo, setSaveInfo] = useState(true);
  const [expiryDate, setExpiryDate] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'United States',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    cvv: '',
  });

  // Calculate order summary
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit order logic would go here
      console.log('Order submitted:', { ...formData, paymentMethod, cartItems, total });
      // In a real app, you would redirect to order confirmation page
      navigate('/order-confirmation');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleExpiryDateChange = (date) => {
    setExpiryDate(date);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Shipping Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="State/Province/Region"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="ZIP / Postal Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      size="small"
                      margin="normal"
                      SelectProps={{ native: true }}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Japan">Japan</option>
                    </TextField>
                  </Grid>
                </Grid>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Save this information for next time"
                  sx={{ mt: 2 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Payment Method
                </Typography>
                
                <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                  <RadioGroup
                    aria-label="payment method"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        border: `1px solid ${paymentMethod === 'credit' ? theme.palette.primary.main : theme.palette.divider}`,
                        borderRadius: 1,
                        backgroundColor: paymentMethod === 'credit' ? `${theme.palette.primary.light}10` : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPaymentMethod('credit')}
                    >
                      <FormControlLabel
                        value="credit"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CreditCard sx={{ mr: 1 }} />
                            <span>Credit / Debit Card</span>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                      
                      {paymentMethod === 'credit' && (
                        <Box sx={{ mt: 2, pl: 4 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Card Number"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="1234 5678 9012 3456"
                                size="small"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Payment fontSize="small" color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Name on Card"
                                name="cardName"
                                value={formData.cardName}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                  views={['year', 'month']}
                                  label="Expiry Date"
                                  value={expiryDate}
                                  onChange={handleExpiryDateChange}
                                  renderInput={(params) => (
                                    <TextField 
                                      {...params} 
                                      fullWidth 
                                      size="small"
                                      InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <CalendarToday fontSize="small" color="action" />
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  )}
                                />
                              </LocalizationProvider>
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="CVV"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                placeholder="123"
                                size="small"
                                type="password"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <LockOutlined fontSize="small" color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Paper>
                    
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        border: `1px solid ${paymentMethod === 'paypal' ? theme.palette.primary.main : theme.palette.divider}`,
                        borderRadius: 1,
                        backgroundColor: paymentMethod === 'paypal' ? `${theme.palette.primary.light}10` : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <FormControlLabel
                        value="paypal"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img 
                              src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                              alt="PayPal" 
                              style={{ height: 20, marginRight: 8 }}
                            />
                            <span>PayPal</span>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                    
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2,
                        border: `1px solid ${paymentMethod === 'bank' ? theme.palette.primary.main : theme.palette.divider}`,
                        borderRadius: 1,
                        backgroundColor: paymentMethod === 'bank' ? `${theme.palette.primary.light}10` : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPaymentMethod('bank')}
                    >
                      <FormControlLabel
                        value="bank"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccountBalance sx={{ mr: 1 }} />
                            <span>Bank Transfer</span>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  </RadioGroup>
                </FormControl>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>Secure Payment</AlertTitle>
                  Your payment information is encrypted and secure. We don't store your credit card details.
                </Alert>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Review Your Order
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SHIPPING ADDRESS
                  </Typography>
                  <Typography>
                    {formData.firstName} {formData.lastName}<br />
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zipCode}<br />
                    {formData.country}<br />
                    {formData.email}<br />
                    {formData.phone}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    PAYMENT METHOD
                  </Typography>
                  {paymentMethod === 'credit' && (
                    <Box>
                      <Typography>Credit / Debit Card ending in •••• {formData.cardNumber.slice(-4) || '••••'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires {expiryDate ? new Date(expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : '••/••'}
                      </Typography>
                    </Box>
                  )}
                  {paymentMethod === 'paypal' && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img 
                        src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                        alt="PayPal" 
                        style={{ height: 20, marginRight: 8 }}
                      />
                      <span>PayPal</span>
                    </Box>
                  )}
                  {paymentMethod === 'bank' && (
                    <Typography>Bank Transfer</Typography>
                  )}
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ORDER ITEMS
                  </Typography>
                  {cartItems.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>
                        {item.name} × {item.quantity}
                      </Typography>
                      <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                    </Box>
                  ))}
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal</Typography>
                    <Typography>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Shipping</Typography>
                    <Typography>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax</Typography>
                    <Typography>${tax.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Total
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      defaultChecked 
                      required 
                      name="terms" 
                      color="primary" 
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the <a href="/terms" style={{ color: theme.palette.primary.main }}>Terms and Conditions</a> and <a href="/privacy" style={{ color: theme.palette.primary.main }}>Privacy Policy</a>
                    </Typography>
                  }
                  sx={{ mt: 2 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <AlertTitle>Complete Your Purchase</AlertTitle>
                Please review your order details before placing your order.
              </Alert>
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => (activeStep === 0 ? navigate(-1) : handleBack())}
          sx={{ mb: 2 }}
        >
          {activeStep === 0 ? 'Back to Cart' : 'Back'}
        </Button>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2 }}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={activeStep === steps.length - 1 ? <Lock /> : null}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              {activeStep === steps.length - 1 ? 'Place Order' : 'Continue'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

// Order Summary Component
const OrderSummary = ({ cartItems, subtotal, shipping, tax, total }) => {
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, position: 'sticky', top: 24 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        Order Summary
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        {cartItems.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="body2">
                {item.name} × {item.quantity}
              </Typography>
            </Box>
            <Typography variant="body2">
              ${(item.price * item.quantity).toFixed(2)}
            </Typography>
          </Box>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal</Typography>
            <Typography>${subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Shipping</Typography>
            <Typography>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Tax</Typography>
            <Typography>${tax.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="h6" color="primary" fontWeight={700}>
              ${total.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <LockOutlined fontSize="small" color="action" sx={{ mr: 1, verticalAlign: 'middle' }} />
        <Typography variant="caption" color="text.secondary">
          Secure Checkout
        </Typography>
      </Box>
    </Paper>
  );
};

export default Checkout;
