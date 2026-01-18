import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    experience: {
        type: [
            {
                company: String,
                role: String,
                startDate: String,
                endDate: String,
                description: String
            }
        ],
        default: []
    },
    education: {
        type: [
            {
                institution: String,
                degree: String,
                fieldOfStudy: String,
                startDate: String,
                endDate: String,
                description: String
            }
        ],
        default: []
    },
    socialLinks: {
        type: Map,
        of: String,
        default: {}
    },
    cv: {
        public_id: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        },
        format: {
            type: String,
            enum: ['pdf', 'doc', 'docx'],
        },
        size: {
            type: Number
        },
        uploadedAt: {
            type: Date
        }
    }
}, {
    timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;