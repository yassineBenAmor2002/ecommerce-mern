import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendOrderConfirmationEmail, sendPaymentFailedEmail } from '../services/emailService.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Test data
const testUser = {
  _id: 'testuser123',
  name: 'Test User',
  email: process.env.TEST_EMAIL || 'test@example.com',
};

const testOrder = {
  _id: 'testorder123',
  orderNumber: 'TEST123',
  user: testUser._id,
  orderItems: [
    {
      name: 'Test Product 1',
      qty: 2,
      price: 29.99,
      product: 'product1',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Test Product 2',
      qty: 1,
      price: 49.99,
      product: 'product2',
      image: 'https://via.placeholder.com/150',
    },
  ],
  shippingAddress: {
    fullName: 'Test User',
    address: '123 Test St',
    city: 'Test City',
    postalCode: '12345',
    country: 'Test Country',
  },
  paymentMethod: 'credit_card',
  itemsPrice: 109.97,
  taxPrice: 10.99,
  shippingPrice: 10.00,
  totalPrice: 130.96,
  status: 'processing',
  paymentResult: {
    id: 'test_payment_123',
    status: 'completed',
    payment_method: 'credit_card',
    payment_provider: 'stripe',
    amount_paid: 130.96,
    currency: 'usd',
    transaction_id: 'test_txn_123',
    transaction_time: new Date(),
  },
  createdAt: new Date(),
};

async function testOrderConfirmationEmail() {
  console.log('Sending test order confirmation email...');
  try {
    const result = await sendOrderConfirmationEmail(testOrder, testUser);
    console.log('✅ Order confirmation email sent successfully!', result);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    return false;
  }
}

async function testPaymentFailedEmail() {
  console.log('Sending test payment failed email...');
  try {
    const errorMessage = 'Card was declined: Insufficient funds';
    const result = await sendPaymentFailedEmail(testOrder, testUser, errorMessage);
    console.log('✅ Payment failed email sent successfully!', result);
    return true;
  } catch (error) {
    console.error('❌ Failed to send payment failed email:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting email service tests...\n');
  
  // Test order confirmation email
  const orderConfirmationResult = await testOrderConfirmationEmail();
  console.log('\n---\n');
  
  // Test payment failed email
  const paymentFailedResult = await testPaymentFailedEmail();
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Order Confirmation Email: ${orderConfirmationResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Payment Failed Email: ${paymentFailedResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  // Exit with appropriate status code
  process.exit(orderConfirmationResult && paymentFailedResult ? 0 : 1);
}

// Connect to MongoDB if needed
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
      runTests();
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
} else {
  runTests();
}
