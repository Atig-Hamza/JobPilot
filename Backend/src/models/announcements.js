import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    buttonText: {
        type: String,
        required: false
    },
    buttonLink: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
