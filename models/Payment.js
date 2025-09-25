import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentIntentId: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true
  },
  tempUserPayload: {
    firstName: String,
    lastName: String,
    email: String,
    receiveUpdates: Boolean
  },
  membershipType: {
    type: String,
    enum: ['free', 'gold', 'diamond', 'platinum'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'expired'],
    default: 'pending'
  },
  stripeData: {
    customerId: String,
    paymentMethod: String,
    amountPaid: Number,
    currency: String,
    stripePaymentId: String,
    paidAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Expire after 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}, { timestamps: true });

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
paymentSchema.index({ email: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
