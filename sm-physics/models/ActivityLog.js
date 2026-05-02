import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    response: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' },
    eventType: {
      type: String,
      enum: [
        'tab-switch',
        'window-blur',
        'window-minimize',
        'copy-attempt',
        'paste-attempt',
        'right-click',
        'screen-capture',
        'fullscreen-exit',
        'test-started',
        'test-submitted',
        'auto-submitted',
        'warning-issued',
      ],
      required: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    description: { type: String },
    marksDeducted: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: false }
);

ActivityLogSchema.index({ student: 1, test: 1 });
ActivityLogSchema.index({ timestamp: -1 });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
