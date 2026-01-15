import mongoose from 'mongoose';

const inviteCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true
    },
    avaliblefor: {
        type: Number,
        required: true
    },
    usedby: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isValid: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const InviteCode = mongoose.model('InviteCode', inviteCodeSchema);

export default InviteCode;