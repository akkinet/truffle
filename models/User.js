import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  receiveUpdates: {
    type: Boolean,
    default: false,
  },
  membership: {
    type: String,
    enum: ['free', 'gold', 'diamond', 'platinum'],
    default: 'free'
  },
  membershipStatus: {
    type: String,
    enum: ['active', 'pending', 'cancelled'],
    default: 'active'
  },
  membershipStartedAt: {
    type: Date,
    default: Date.now
  },
  membershipExpiresAt: {
    type: Date,
    default: null // null for lifetime memberships
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  membershipPaidAmount: {
    type: Number,
    default: 0
  },
  membershipPaymentRef: {
    type: String,
    default: null
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
