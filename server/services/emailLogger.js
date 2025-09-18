import mongoose from 'mongoose';
import { log } from '../utils/logger.js';

// Define the email log schema
const emailLogSchema = new mongoose.Schema({
  jobId: { type: String, required: true, index: true },
  to: { type: String, required: true, index: true },
  subject: { type: String, required: true },
  template: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['queued', 'processing', 'completed', 'failed', 'retrying'],
    index: true 
  },
  priority: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  error: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  sentAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

// Add indexes for common queries
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ to: 1, createdAt: -1 });
emailLogSchema.index({ template: 1, createdAt: -1 });

// Static methods
emailLogSchema.statics.logEvent = async function(job, eventType, error = null) {
  try {
    const update = {
      status: job.status,
      attempts: job.attempts,
      [eventType === 'completed' ? 'completedAt' : 'sentAt']: new Date(),
    };

    if (error) {
      update.error = error.message || String(error);
    }

    if (eventType === 'started') {
      update.metadata = job.metadata || {};
    }

    await this.findOneAndUpdate(
      { jobId: job.id },
      { 
        $set: update,
        $setOnInsert: {
          jobId: job.id,
          to: job.to,
          subject: job.subject,
          template: job.template,
          priority: job.priority,
          maxRetries: job.retries,
          status: job.status,
          metadata: job.metadata || {},
        }
      },
      { upsert: true, new: true }
    );

    log.email(`[${job.id}] ${eventType}: ${job.to} - ${job.subject}`);
  } catch (error) {
    log.error('Error logging email event:', error);
  }
};

// Create the model
const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;
