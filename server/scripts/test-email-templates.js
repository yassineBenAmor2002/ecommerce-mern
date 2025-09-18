import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { emailService } from '../services/index.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Sample test data
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: process.env.TEST_EMAIL || 'test@example.com',
  isVerified: true,
};

const testOrder = {
  _id: new mongoose.Types.ObjectId(),
  orderNumber: 'TEST' + Math.floor(100000 + Math.random() * 900000),
  user: testUser._id,
  orderItems: [
    {
      name: 'Test Product',
      qty: 2,
      price: 29.99,
      product: new mongoose.Types.ObjectId(),
    },
  ],
  shippingAddress: {
    address: '123 Test St',
    city: 'Test City',
    postalCode: '12345',
    country: 'Test Country',
  },
  paymentMethod: 'credit_card',
  itemsPrice: 59.98,
  taxPrice: 12.0,
  shippingPrice: 10.0,
  totalPrice: 81.98,
  isPaid: true,
  paidAt: new Date(),
  isDelivered: false,
  paymentResult: {
    id: 'test_payment_id_' + Math.random().toString(36).substring(7),
    status: 'succeeded',
    update_time: new Date(),
    email_address: testUser.email,
  },
};

// Test email templates
const testTemplates = [
  {
    name: 'ORDER_CONFIRMATION',
    data: {
      order: testOrder,
      user: testUser,
    },
  },
  {
    name: 'PAYMENT_CONFIRMATION',
    data: {
      order: { ...testOrder, paymentResult: testOrder.paymentResult },
      user: testUser,
      paymentDetails: testOrder.paymentResult,
    },
  },
  {
    name: 'PAYMENT_FAILED',
    data: {
      order: testOrder,
      user: testUser,
      error: {
        message: 'Insufficient funds',
        code: 'card_declined',
      },
      retryUrl: 'http://localhost:3000/checkout/payment',
    },
  },
  {
    name: 'ORDER_SHIPPED',
    data: {
      order: { ...testOrder, isDelivered: true, deliveredAt: new Date() },
      user: testUser,
      trackingInfo: {
        number: '1Z12345E0205271688',
        carrier: 'UPS',
        url: 'https://www.ups.com/track?tracknum=1Z12345E0205271688',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
    },
  },
  {
    name: 'PASSWORD_RESET',
    data: {
      user: testUser,
      resetUrl: 'http://localhost:3000/reset-password?token=test_reset_token',
    },
  },
  {
    name: 'ACCOUNT_VERIFICATION',
    data: {
      user: testUser,
      verificationUrl: 'http://localhost:3000/verify-email?token=test_verification_token',
    },
  },
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

// Test email sending
const testEmailTemplates = async () => {
  console.log('Starting email template tests...\n');
  
  for (const template of testTemplates) {
    try {
      console.log(`Testing template: ${template.name}`);
      console.log('Sending to:', testUser.email);
      
      const result = await emailService.sendTemplateEmail(
        template.name,
        template.data,
        { test: true }
      );
      
      console.log(`✅ Success: Email queued with job ID: ${result}\n`);
    } catch (error) {
      console.error(`❌ Error testing template ${template.name}:`, error.message);
      console.error(error.stack);
      console.log('');
    }
  }
  
  console.log('Email template tests completed.');
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await testEmailTemplates();
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
main();
