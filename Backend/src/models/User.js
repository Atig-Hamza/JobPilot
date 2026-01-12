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
  credits: {
    type: Number,
    default: 0
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
      isVerified: true
    });
    console.log('Admin account created');
  }
};

export default User;
