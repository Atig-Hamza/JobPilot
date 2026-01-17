import { getProfileByUserId, createOrUpdateProfile } from "../services/profileService.js";
import catchAsync from '../utils/catchAsync.js';

export const getProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    if (!profile) {
        return res.status(404).json({
            status: 'fail',
            message: 'Profile not found'
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            profile
        }
    });
});

export const upsertProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const profileData = req.body;
    const profile = await createOrUpdateProfile(userId, profileData);
    res.status(200).json({
        status: 'success',
        data: {
            profile
        }
    });
});