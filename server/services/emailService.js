import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import ejs from 'ejs';
import emailConfig from '../config/email.js';
import { ORDER_STATUS } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transporter object using the SMTP transport
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Email templates directory
const TEMPLATES_DIR = path.join(__dirname, '..', emailConfig.templates.dir);

// Track retry attempts
const retryAttempts = new Map();

/**
 * Send an email using a template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name (without .ejs extension)
 * @param {Object} options.data - Data to pass to the template
 * @returns {Promise<Object>} - Result of sending the email
 */
const sendEmail = async ({ to, subject, template, data = {}, retryCount = 0 }) => {
  // Check if email sending is disabled
  if (!emailConfig.options.enabled) {
    console.log(`[Email] Email sending is disabled. Would send to ${to} with subject: ${subject}`);
    return { success: true, messageId: 'disabled', skipped: true };
  }

  try {
    // Render the email template
    const templatePath = path.join(TEMPLATES_DIR, `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, { 
      ...data,
      subject,
      config: emailConfig,
      // Backward compatibility
      siteName: emailConfig.site.name,
      logoUrl: emailConfig.site.logoUrl,
      supportEmail: emailConfig.support.email,
      frontendUrl: emailConfig.site.url,
      user: data.user || {},
      order: data.order || {}
    });

    // Send the email
    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: `${emailConfig.site.name} - ${subject}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Clear any previous retry attempts
    if (retryAttempts.has(to)) {
      retryAttempts.delete(to);
    }
    
    console.log(`[Email] Sent to ${to} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error(`[Email] Error sending to ${to}:`, error.message);
    
    // Handle retries for transient failures
    const isTransient = error.responseCode >= 400 && error.responseCode < 500;
    const maxRetries = emailConfig.options.maxRetries || 3;
    
    if (isTransient && retryCount < maxRetries) {
      const nextRetry = retryCount + 1;
      const delay = emailConfig.options.retryDelay || 10000; // 10 seconds
      
      console.log(`[Email] Will retry (${nextRetry}/${maxRetries}) in ${delay}ms`);
      
      // Store attempt
      retryAttempts.set(to, {
        count: nextRetry,
        lastAttempt: Date.now(),
        subject,
        template
      });
      
      // Schedule retry
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const result = await sendEmail({ to, subject, template, data, retryCount: nextRetry });
            resolve(result);
          } catch (retryError) {
            resolve({ success: false, error: retryError.message });
          }
        }, delay);
      });
    }
    
    // If we've exhausted retries or it's a permanent failure, log and throw
    if (retryCount >= maxRetries) {
      console.error(`[Email] Max retries (${maxRetries}) exceeded for ${to}`);
    }
    
    throw new Error(`Failed to send email after ${retryCount} attempts: ${error.message}`);
  }
};

/**
 * Send order confirmation email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Result of sending the email
 */
export const sendOrderConfirmationEmail = async (order, user) => {
  const subject = `Order Confirmation - #${order.orderNumber || order._id.toString().substring(18, 24).toUpperCase()}`;
  
  // Format order items for the email
  const orderItems = order.orderItems.map(item => ({
    ...item.toObject ? item.toObject() : item,
    total: (item.price * item.qty).toFixed(2),
  }));

  // Calculate order totals
  const orderTotal = (order.totalPrice || 0).toFixed(2);
  const taxAmount = (order.taxPrice || 0).toFixed(2);
  const shippingAmount = (order.shippingPrice || 0).toFixed(2);
  const subtotal = ((order.totalPrice || 0) - (order.taxPrice || 0) - (order.shippingPrice || 0)).toFixed(2);

  return sendEmail({
    to: user.email,
    subject,
    template: 'order-confirmation',
    data: {
      user: {
        name: user.name,
        email: user.email,
      },
      order: {
        ...(order.toObject ? order.toObject() : order),
        orderNumber: order.orderNumber || order._id.toString().substring(18, 24).toUpperCase(),
        orderDate: new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        items: orderItems,
        subtotal,
        tax: taxAmount,
        shipping: shippingAmount,
        total: orderTotal,
        status: order.status || 'processing',
        paymentMethod: order.paymentMethod || 'Credit Card',
        paymentStatus: order.paymentResult?.status || 'Paid',
        shippingAddress: order.shippingAddress || {},
        billingAddress: order.billingAddress || order.shippingAddress || {},
      },
    },
  });
};

/**
 * Send payment failed email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 * @param {string} errorMessage - Error message
 * @returns {Promise<Object>} - Result of sending the email
 */
export const sendPaymentFailedEmail = async (order, user, errorMessage) => {
  const subject = `Payment Failed - Order #${order.orderNumber || order._id.toString().substring(18, 24).toUpperCase()}`;
  
  return sendEmail({
    to: user.email,
    subject,
    template: 'payment-failed',
    data: {
      user: {
        name: user.name,
        email: user.email,
      },
      order: {
        orderNumber: order.orderNumber || order._id.toString().substring(18, 24).toUpperCase(),
        orderDate: new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        total: (order.totalPrice || 0).toFixed(2),
        paymentMethod: order.paymentMethod || 'Credit Card',
        error: errorMessage || 'Payment could not be processed',
      },
      retryUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}/payment`,
    },
  });
};

export default {
  sendEmail,
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
};
