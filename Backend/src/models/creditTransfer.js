import mongoose from "mongoose";

const creditTransferSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 1,
    },
    status: {
        type: String,
        enum: ['completed', 'failed'],
        default: 'completed',
    },
}, {
    timestamps: true,
});

const CreditTransfer = mongoose.model("CreditTransfer", creditTransferSchema);

export default CreditTransfer;
