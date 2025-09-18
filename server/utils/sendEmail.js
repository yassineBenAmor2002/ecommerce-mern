import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name ? user.name.split(' ')[0] : 'User';
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
  }

  // Create a transporter
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid for production
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Use Mailtrap for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject, templateVars = {}) {
    try {
      // 1) Render HTML based on a pug template
      const templatePath = path.join(
        __dirname,
        '..',
        'views',
        'emails',
        `${template}.pug`
      );
      
      const html = pug.renderFile(templatePath, {
        firstName: this.firstName,
        url: this.url,
        subject,
        ...templateVars,
      });

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html),
      };

      // 3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('There was an error sending the email. Please try again later.');
    }
  }

  // Send welcome email
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Our E-commerce Store!');
  }

  // Send password reset email
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)',
      { resetURL: this.url }
    );
  }

  // Send email verification
  async sendEmailVerification() {
    await this.send(
      'emailVerification',
      'Verify your email address',
      { verificationURL: this.url }
    );
  }

  // Send order confirmation
  async sendOrderConfirmation(order) {
    await this.send(
      'orderConfirmation',
      'Your Order Confirmation',
      { order, orderURL: this.url }
    );
  }

  // Send order status update
  async sendOrderStatusUpdate(order) {
    await this.send(
      'orderStatusUpdate',
      `Order #${order.orderNumber} Status Update`,
      { order, orderURL: this.url }
    );
  }

  // Send password changed notification
  async sendPasswordChanged() {
    await this.send(
      'passwordChanged',
      'Your password has been changed',
      { supportEmail: process.env.EMAIL_SUPPORT }
    );
  }
}

export default Email;

// Helper function to send email
export const sendEmail = async (options) => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 2) Define the email options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};
