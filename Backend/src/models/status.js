import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
    llmrequestenumber: {
        type: Number,
        default: 0
    },
    websearchrequestenumber: {
        type: Number,
        default: 0
    },
    pageviewnumber: {
        type: Number,
        default: 0
    },
    badresponceAI: {
        type: Number,
        default: 0
    },
    goodresponceAI: {
        type: Number,
        default: 0
    },
    copyAI: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Status = mongoose.model('Status', statusSchema);

export default Status;