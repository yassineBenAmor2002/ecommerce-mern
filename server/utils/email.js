import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transport for sending emails
const createTransport = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production - use SMTP
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  // Development - use ethereal.email for testing
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'julianne.metz@ethereal.email',
      pass: 'R6X7Hjv7z4D1YwWrKp',
    },
  });
};

// Create a new Email instance
class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name ? user.name.split(' ')[0] : 'User';
    this.url = url;
    this.from = `"${process.env.EMAIL_FROM_NAME || 'Shop Team'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`;
  }

  // Create a transport and send email
  async send(template, subject, context = {}) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        path.join(
          __dirname,
          '..',
          'templates',
          'emails',
          `${template}.pug`
        ),
        {
          name: this.firstName,
          url: this.url,
          subject,
          ...context,
          // Add app name and other common variables
          appName: process.env.APP_NAME,
          appUrl: process.env.FRONTEND_URL,
          supportEmail: process.env.EMAIL_SUPPORT,
          currentYear: new Date().getFullYear(),
        }
      );

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html, {
          wordwrap: 130,
        }),
      };

      // 3) Create a transport and send email
      const transporter = createTransport();
      await transporter.sendMail(mailOptions);
      
      // Log in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent to:', this.to);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(mailOptions));
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('There was an error sending the email. Please try again later.');
    }
  }

  // Send welcome email
  async sendWelcome() {
    await this.send('welcome', 'Welcome to our shop!');
  }

  // Send password reset email
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)',
      { url: this.url }
    );
  }

  // Send order confirmation email
  async sendOrderConfirmation(order) {
    await this.send(
      'orderConfirmation',
      `Order Confirmation #${order._id}`,
      { order, orderUrl: `${process.env.FRONTEND_URL}/orders/${order._id}` }
    );
  }

  // Send order status update email
  async sendOrderStatusUpdate(order, status) {
    await this.send(
      'orderStatusUpdate',
      `Order #${order._id} Status Update: ${status}`,
      { 
        order: { ...order, status },
        status,
        orderUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`
      }
    );
  }

  // Send account verification email
  async sendVerificationEmail(verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await this.send(
      'verifyEmail',
      'Please verify your email address',
      { verificationUrl }
    );
  }
}

// Helper function to send email (for use in controllers)
export const sendEmail = async (options) => {
  try {
    const { to, subject, template, context } = options;
    
    // Create a new email instance
    const email = new Email({ email: to }, context?.url || '');
    
    // Send the email with the specified template
    await email.send(template, subject, context);
    
    return true;
  } catch (error) {
    console.error('Error in sendEmail helper:', error);
    throw error;
  }
};

export default Email;
