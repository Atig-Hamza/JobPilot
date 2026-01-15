import mongoose from "mongoose";

const creditCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
    },
    credits: {
        type: Number,
        required: true,
        default: 0,
    },
    usedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    isValid: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const CreditCode = mongoose.model("CreditCode", creditCodeSchema);

export default CreditCode;