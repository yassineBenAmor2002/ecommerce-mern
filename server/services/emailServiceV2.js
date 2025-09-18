import emailQueue from './emailQueue.js';
import EmailLog from './emailLogger.js';
import { renderTemplate, getTemplateConfig } from './emailTemplates.js';
import { log } from '../utils/logger.js';

class EmailService {
  constructor() {
    // Set up event listeners for the queue
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for the email queue
   */
  setupEventListeners() {
    // Log queue events
    emailQueue.on('queued', async (job) => {
      await EmailLog.logEvent(job, 'queued');
    });

    emailQueue.on('started', async (job) => {
      await EmailLog.logEvent(job, 'started');
    });

    emailQueue.on('completed', async (job) => {
      await EmailLog.logEvent(job, 'completed');
    });

    emailQueue.on('failed', async (job) => {
      await EmailLog.logEvent(job, 'failed', job.error);
    });

    emailQueue.on('retry', async (job) => {
      await EmailLog.logEvent(job, 'retry', job.error);
    });
  }

  /**
   * Send an email using a template
   * @param {string} templateName - Name of the template to use
   * @param {Object} data - Data for the template
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Job ID
   */
  async sendTemplateEmail(templateName, data, options = {}) {
    try {
      // Get template configuration
      const templateConfig = getTemplateConfig(templateName);
      
      // Render the email
      const { subject, html } = await renderTemplate(templateName, data);
      
      // Add to queue
      const jobId = emailQueue.add({
        to: data.user?.email,
        subject,
        template: templateConfig.template,
        data: { ...data, subject },
        priority: options.priority || templateConfig.priority,
        retries: options.retries || 3,
        metadata: {
          template: templateName,
          ...options.metadata,
        },
      });

      return jobId;
    } catch (error) {
      log.error('Error sending template email:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation email
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Job ID
   */
  async sendOrderConfirmation(order, user, options = {}) {
    return this.sendTemplateEmail(
      'ORDER_CONFIRMATION',
      { order, user },
      { ...options, priority: 10 }
    );
  }

  /**
   * Send payment failed email
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @param {string} error - Error message
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Job ID
   */
  async sendPaymentFailed(order, user, error, options = {}) {
    return this.sendTemplateEmail(
      'PAYMENT_FAILED',
      { 
        order, 
        user, 
        error: { message: error },
        retryUrl: `${emailConfig.site.url}/orders/${order._id}/payment`
      },
      { ...options, priority: 20 }
    );
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Job ID
   */
  async sendPasswordReset(user, resetToken, options = {}) {
    const resetUrl = `${emailConfig.site.url}/reset-password?token=${resetToken}`;
    return this.sendTemplateEmail(
      'PASSWORD_RESET',
      { user, resetUrl },
      { ...options, priority: 15 }
    );
  }

  /**
   * Send account verification email
   * @param {Object} user - User object
   * @param {string} verificationToken - Verification token
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Job ID
   */
  async sendVerificationEmail(user, verificationToken, options = {}) {
    const verificationUrl = `${emailConfig.site.url}/verify-email?token=${verificationToken}`;
    return this.sendTemplateEmail(
      'ACCOUNT_VERIFICATION',
      { user, verificationUrl },
      { ...options, priority: 5 }
    );
  }

  /**
   * Send shipping update email
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @param {Object} trackingInfo - Tracking information
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - Job ID
   */
  async sendShippingUpdate(order, user, trackingInfo, options = {}) {
    return this.sendTemplateEmail(
      'SHIPPING_UPDATE',
      { order, user, trackingInfo },
      { ...options, priority: 8 }
    );
  }

  /**
   * Get queue statistics
   * @returns {Object} Queue statistics
   */
  getQueueStats() {
    return emailQueue.getStats();
  }

  /**
   * Pause the email queue
   */
  pauseQueue() {
    emailQueue.pause();
  }

  /**
   * Resume the email queue
   */
  resumeQueue() {
    emailQueue.resume();
  }

  /**
   * Clear the email queue
   * @returns {number} Number of jobs cleared
   */
  clearQueue() {
    return emailQueue.clear();
  }
}

// Export a singleton instance
const emailService = new EmailService();
export default emailService;
