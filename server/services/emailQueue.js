import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { log } from '../utils/logger.js';
import emailService from './emailService.js';

class EmailQueue extends EventEmitter {
  constructor(concurrency = 3) {
    super();
    this.queue = [];
    this.inProgress = 0;
    this.concurrency = concurrency;
    this.paused = false;
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      retries: 0,
    };
  }

  /**
   * Add an email to the queue
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.template - Template name
   * @param {Object} options.data - Template data
   * @param {number} options.priority - Priority (higher = more important)
   * @param {number} options.retries - Number of retry attempts
   * @returns {string} - Job ID
   */
  add({
    to, subject, template, data = {}, priority = 0, retries = 3
  }) {
    const job = {
      id: uuidv4(),
      to,
      subject,
      template,
      data,
      priority,
      retries,
      attempts: 0,
      status: 'queued',
      createdAt: new Date(),
    };

    // Add to queue and sort by priority (highest first)
    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority);
    
    this.stats.total++;
    this.emit('queued', job);
    this.processQueue();
    
    return job.id;
  }

  /**
   * Process the next job in the queue
   */
  async processQueue() {
    // Check if we can process more jobs
    if (this.paused || this.inProgress >= this.concurrency || this.queue.length === 0) {
      return;
    }

    // Get the highest priority job
    const job = this.queue.shift();
    if (!job) return;

    this.inProgress++;
    job.status = 'processing';
    job.startedAt = new Date();
    job.attempts++;

    this.emit('started', job);

    try {
      // Send the email
      const result = await emailService.sendEmail({
        to: job.to,
        subject: job.subject,
        template: job.template,
        data: job.data,
        metadata: { jobId: job.id },
      });

      // Update job status
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      
      this.stats.success++;
      this.emit('completed', job);
    } catch (error) {
      // Handle retries
      if (job.attempts <= job.retries) {
        job.status = 'retrying';
        job.error = error.message;
        job.nextAttempt = new Date(Date.now() + (60000 * job.attempts)); // Exponential backoff
        
        // Re-add to queue with higher priority
        this.queue.unshift({
          ...job,
          priority: job.priority + 1 // Increase priority on retry
        });
        
        this.stats.retries++;
        this.emit('retry', job);
      } else {
        // Max retries reached
        job.status = 'failed';
        job.error = error.message;
        job.failedAt = new Date();
        
        this.stats.failed++;
        this.emit('failed', job);
      }
    } finally {
      this.inProgress--;
      this.processQueue(); // Process next job
    }
  }

  /**
   * Pause the queue
   */
  pause() {
    this.paused = true;
    this.emit('paused');
  }

  /**
   * Resume the queue
   */
  resume() {
    this.paused = false;
    this.emit('resumed');
    this.processQueue();
  }

  /**
   * Get queue statistics
   * @returns {Object} Queue statistics
   */
  getStats() {
    return {
      ...this.stats,
      queued: this.queue.length,
      inProgress: this.inProgress,
      isPaused: this.paused,
    };
  }

  /**
   * Clear the queue
   */
  clear() {
    const count = this.queue.length;
    this.queue = [];
    this.emit('cleared', { count });
    return count;
  }
}

// Create a singleton instance
const emailQueue = new EmailQueue();

export default emailQueue;
