import Announcement from '../models/announcements.js';

export const createAnnouncement = async (data) => {
    try {
        const announcement = await Announcement.create(data);
        return announcement;
    } catch (error) {
        throw error;
    }
};

export const getLatestAnnouncement = async () => {
    try {
        const announcement = await Announcement.findOne().sort({ createdAt: -1 });
        return announcement;
    } catch (error) {
        throw error;
    }
};
