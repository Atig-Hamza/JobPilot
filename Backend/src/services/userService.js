import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import { AppError } from "../utils/AppError.js";

export const spendUserCredits = async (userId, creditsToSpend) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (user.credits < creditsToSpend) {
        throw new Error('Insufficient credits');
    }
    user.credits -= creditsToSpend;
    await user.save();
    return user.credits;
}

export const updatePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
        throw new AppError('Current password is incorrect', 401);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.lastPasswordChange = Date.now();
    await user.save();
    return true;
};

export const deleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.isBanned = true;
    await user.save();
    return true;
};