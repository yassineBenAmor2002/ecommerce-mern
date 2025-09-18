// Core email services
export { default as emailService } from './emailServiceV2.js';
export { default as emailQueue } from './emailQueue.js';
export { default as EmailLog } from './emailLogger.js';
export { renderTemplate, getTemplateConfig, getTemplateNames } from './emailTemplates.js';

// Legacy email service (for backward compatibility)
import { sendOrderConfirmationEmail, sendPaymentFailedEmail } from './emailService.js';
export const legacyEmailService = {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail
};

// Export all email-related services
export * from './emailTemplates.js';

// Helper function to initialize email services
export const initEmailServices = async () => {
  // Add any initialization logic here
  console.log('Email services initialized');
  return true;
};

// Default export with all email services
export default {
  emailService,
  emailQueue,
  EmailLog,
  legacyEmailService,
  initEmailServices,
  // Re-export template functions
  renderTemplate,
  getTemplateConfig,
  getTemplateNames,
};
