import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: [String],
        default: [],
        required: true
    }
}, {
    timestamps: true
});

const History = mongoose.model('History', historySchema);

export default History;