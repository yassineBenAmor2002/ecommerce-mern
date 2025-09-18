export const emailConfig = {
  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password',
    },
  },
  
  // Email Sender Information
  from: {
    name: process.env.EMAIL_FROM_NAME || 'E-Commerce Store',
    address: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
  },
  
  // Support Information
  support: {
    email: process.env.SUPPORT_EMAIL || 'support@example.com',
  },
  
  // Site Information
  site: {
    name: process.env.SITE_NAME || 'E-Commerce Store',
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    logoUrl: process.env.SITE_LOGO_URL || 'https://via.placeholder.com/150x50',
  },
  
  // Email Templates Configuration
  templates: {
    dir: process.env.EMAIL_TEMPLATES_DIR || 'templates/emails',
    defaultLayout: 'main',
    viewEngine: 'ejs',
  },
  
  // Email Sending Options
  options: {
    // Maximum number of retries for failed emails
    maxRetries: 3,
    // Time between retries in milliseconds
    retryDelay: 10000,
    // Enable/disable email sending (useful for development)
    enabled: process.env.EMAIL_ENABLED !== 'false',
  },
};

// Export default configuration
export default emailConfig;
