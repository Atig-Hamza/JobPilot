import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    default: 'local'
  },
  avatar: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  loginHistory: [{
    ip: String,
    location: String,
    timestamp: Date
  }],
  AllLoginDevices: [{
    ip: String,
    location: String,
    accessToken: String,
    timestamp: Date,
    deviceInfo: String
  }],
  lastLogin: Date,
  lastLogout: Date,
  lastActivity: Date,
  lastPasswordChange: Date,
  lastPasswordReset: Date,
  credits: {
    type: Number,
    default: 0
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorSecret: {
    type: String,
    select: false
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorRecoveryCodes: {
    type: [String],
    select: false
  },
  loginOTP: {
    type: String,
    select: false
  },
  loginOTPExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export const adminAccountInit = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  if (!adminEmail || !adminPassword) return;

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      fullName: 'Hamza Atig',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      credits: 500000
    });
    console.log('Admin account created');
  }
};

export default User;
