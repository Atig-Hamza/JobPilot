import { createAnnouncement, getLatestAnnouncement } from "../services/announcementService.js";
import catchAsync from "../utils/catchAsync.js";

export const createNewAnnouncement = catchAsync(async (req, res) => {
    const data = { ...req.body };
    if (req.file) {
        const protocol = req.protocol;
        const host = req.get('host');
        data.image = `${protocol}://${host}/media/announcements/${req.file.filename}`;
    }

    const announcement = await createAnnouncement(data);
    res.status(201).json({
        status: "success",
        data: {
            announcement
        }
    });
});

export const getLatest = catchAsync(async (req, res) => {
    const announcement = await getLatestAnnouncement();
    res.status(200).json({
        status: "success",
        data: {
            announcement
        }
    });
});
