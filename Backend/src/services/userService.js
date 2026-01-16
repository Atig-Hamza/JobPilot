import User from "../models/User.js";


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