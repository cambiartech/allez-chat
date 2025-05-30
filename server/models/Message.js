const mongoose = require('mongoose');

// Get TTL from environment or default to 1 hour (3600 seconds)
const MESSAGE_TTL = process.env.MESSAGE_TTL || 3600;

const messageSchema = new mongoose.Schema({
  tripId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['driver', 'rider', 'admin']
  },
  message: {
    type: String,
    required: true
  },
  // System messages like "user joined" will be filtered out
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: MESSAGE_TTL // Document will be automatically deleted after TTL seconds
  }
});

// Create indexes
messageSchema.index({ tripId: 1, timestamp: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 