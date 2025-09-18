import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import emailConfig from '../config/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

// Template configuration
const TEMPLATES = {
  ORDER_CONFIRMATION: {
    template: 'order-confirmation',
    subject: 'Order Confirmation - #{order.orderNumber || order._id}',
    priority: 10,
    requiredFields: ['order', 'user'],
  },
  PAYMENT_CONFIRMATION: {
    template: 'payment-confirmation',
    subject: 'Payment Confirmed - Order #{order.orderNumber || order._id}',
    priority: 15,
    requiredFields: ['order', 'user', 'paymentDetails'],
  },
  PAYMENT_FAILED: {
    template: 'payment-failed',
    subject: 'Payment Failed - Order #{order.orderNumber || order._id}',
    priority: 20, // Higher priority for payment issues
    requiredFields: ['order', 'user', 'error'],
  },
  ORDER_SHIPPED: {
    template: 'order-shipped',
    subject: 'Your Order #{order.orderNumber || order._id} Has Shipped',
    priority: 12,
    requiredFields: ['order', 'user', 'trackingInfo'],
  },
  PASSWORD_RESET: {
    template: 'password-reset',
    subject: 'Password Reset Request',
    priority: 5,
    requiredFields: ['user', 'resetUrl'],
  },
  ACCOUNT_VERIFICATION: {
    template: 'account-verification',
    subject: 'Verify Your Email Address',
    priority: 5,
    requiredFields: ['user', 'verificationUrl'],
  },
  SHIPPING_UPDATE: {
    template: 'shipping-update',
    subject: 'Shipping Update - Order #{order.orderNumber || order._id}',
    priority: 8,
    requiredFields: ['order', 'user', 'trackingInfo'],
  },
};

/**
 * Render an email template with the given data
 * @param {string} templateName - Name of the template to render
 * @param {Object} data - Data to pass to the template
 * @returns {Promise<{subject: string, html: string}>} - Rendered email content
 */
export const renderTemplate = async (templateName, data = {}) => {
  const templateConfig = TEMPLATES[templateName];
  if (!templateConfig) {
    throw new Error(`Template ${templateName} not found`);
  }

  // Check required fields
  const missingFields = templateConfig.requiredFields.filter(
    field => data[field] === undefined || data[field] === null
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    // Prepare template data
    const templateData = {
      ...data,
      config: emailConfig,
      // Helper functions
      formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency || 'USD',
        }).format(amount);
      },
      formatDate: (date, locale = 'en-US') => {
        return new Date(date).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      },
    };

    // Render subject
    let subject = templateConfig.subject;
    if (data.order?.orderNumber) {
      subject = subject.replace('#{orderNumber}', data.order.orderNumber);
    }

    // Add site name to subject if not already present
    if (!subject.includes(emailConfig.site.name)) {
      subject = `${emailConfig.site.name} - ${subject}`;
    }

    // Render template
    const templatePath = path.join(TEMPLATES_DIR, `${templateConfig.template}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);

    return { subject, html };
  } catch (error) {
    console.error(`Error rendering template ${templateName}:`, error);
    throw new Error(`Failed to render email template: ${error.message}`);
  }
};

/**
 * Get email template configuration
 * @param {string} templateName - Name of the template
 * @returns {Object} Template configuration
 */
export const getTemplateConfig = (templateName) => {
  const config = TEMPLATES[templateName];
  if (!config) {
    throw new Error(`Template ${templateName} not found`);
  }
  return { ...config };
};

/**
 * Get all available template names
 * @returns {string[]} Array of template names
 */
export const getTemplateNames = () => Object.keys(TEMPLATES);

export default {
  renderTemplate,
  getTemplateConfig,
  getTemplateNames,
  TEMPLATES,
};
