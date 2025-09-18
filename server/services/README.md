# Email Services

This directory contains the email services for the MERN E-Commerce application. The services are designed to be modular, scalable, and easy to maintain.

## Services Overview

### 1. Email Service V2 (`emailServiceV2.js`)
The main service for sending emails using templates. It provides a high-level API for common email operations.

### 2. Email Queue (`emailQueue.js`)
A queue system for managing email sending with concurrency control, retries, and prioritization.

### 3. Email Logger (`emailLogger.js`)
Logs all email sending attempts to the database for tracking and auditing.

### 4. Email Templates (`emailTemplates.js`)
Manages email templates and rendering using EJS.

## Usage

### Sending Emails

```javascript
import { emailService } from './services';

// Send order confirmation
const jobId = await emailService.sendOrderConfirmation(order, user);

// Send payment failed
await emailService.sendPaymentFailed(order, user, errorMessage);

// Send password reset
await emailService.sendPasswordReset(user, resetToken);

// Send custom template
await emailService.sendTemplateEmail('TEMPLATE_NAME', templateData, options);
```

### Managing the Queue

```javascript
// Get queue statistics
const stats = emailService.getQueueStats();

// Pause the queue
emailService.pauseQueue();

// Resume the queue
emailService.resumeQueue();

// Clear the queue
const cleared = emailService.clearQueue();
```

### Template Development

1. Add a new template file in `server/templates/emails/`
2. Add template configuration in `emailTemplates.js`
3. Use the template with `emailService.sendTemplateEmail()`

## Configuration

Email services are configured via environment variables. See `.env.example` for available options.

## Testing

To test email sending in development:

1. Use MailHog (recommended) or another SMTP testing server
2. Run the test script:
   ```bash
   npm run test:email
   ```

## Monitoring

Email sending is logged to the `email_logs` collection in MongoDB. You can query this collection to monitor email delivery status.

## Best Practices

1. Always use templates for consistent email formatting
2. Set appropriate priorities for different email types
3. Handle errors gracefully and log them
4. Use the queue system for non-critical emails
5. Monitor queue statistics and adjust concurrency as needed
