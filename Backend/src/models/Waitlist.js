import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const waitlistSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
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
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Prefer not to say', 'Non-binary'],
        required: true
    },
    inviteCode: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    howDidYouFindUs: {
        type: String,
        required: false,
        trim: true
    },
    whyJoin: {
        type: String,
        required: false,
        trim: true
    }
}, {
    timestamps: true
});

waitlistSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;

