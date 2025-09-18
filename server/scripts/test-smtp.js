import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create a test account using ethereal.email
// Generate a new test account at https://ethereal.email/create
const testAccount = {
  user: 'kaycee.hickle@ethereal.email',
  pass: 'vCzH5YkfUxY3N7k7u4'
};

// Create a transporter object using the test account
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

// Email options
const mailOptions = {
  from: '"E-Commerce Test" <test@example.com>',
  to: 'recipient@example.com',
  subject: 'Test Email from E-Commerce',
  text: 'This is a test email sent from the E-Commerce application.',
  html: `
    <h1>Test Email</h1>
    <p>This is a <strong>test email</strong> sent from the E-Commerce application.</p>
    <p>If you can read this, the email service is working correctly!</p>
    <p>Best regards,<br>E-Commerce Team</p>
  `,
};

// Send the email
console.log('Sending test email...');

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
    process.exit(1);
  }
  
  console.log('Test email sent successfully!');
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  console.log('Message ID: %s', info.messageId);
  
  // Log the test account credentials for viewing the email
  console.log('\nYou can view the email at: https://ethereal.email/');
  console.log('Test Account:', testAccount);
  
  process.exit(0);
});
