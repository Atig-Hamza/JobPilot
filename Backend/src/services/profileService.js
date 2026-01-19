import Profile from "../models/profile.js";
import { generateJobOfferForUser } from "./jobService.js";

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
        const savedProfile = await profile.save();

        try {
            await generateJobOfferForUser(savedProfile, savedProfile.userId);
        } catch (error) {
            console.error("Failed to generate initial jobs for new profile:", error);
        }

        return savedProfile;
    }
}