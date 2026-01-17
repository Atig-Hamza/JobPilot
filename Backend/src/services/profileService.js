import Profile from "../models/profile.js";

export const getProfileByUserId = async (userId) => {
    return await Profile.findOne({ userId });
}

export const createOrUpdateProfile = async (userId, profileData) => {
    let profile = await Profile.findOne({ userId });
    if (profile) {
        Object.assign(profile, profileData);
        return await profile.save();
    } else {
        profile = new Profile({ userId, ...profileData });
        return await profile.save();
    }
}