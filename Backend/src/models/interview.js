import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    results: {
        type: String,
        default: ''
    },
    spendtime: {
        type: Number,
        default: 0
    },
    needtoimprove: {
        type: String,
        default: ''
    },
}, {
    timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;