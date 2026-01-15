import InviteCode from "../models/inviteCode.js";
import CreditCode from "../models/creditCode.js";
import User from "../models/User.js";

export const generateInviteCode = async (code, availableFor, expiresAt) => {
    const newInviteCode = await InviteCode.create({
        code,
        avaliblefor: availableFor,
        expiresAt
    });
    return newInviteCode;
}

export const generateCreditCode = async (code, credits) => {
    const newCreditCode = await CreditCode.create({
        code,
        credits
    });
    return newCreditCode;
}

export const getAllInviteCodes = async () => {
    const inviteCodes = await InviteCode.find().sort({ createdAt: -1 });
    return inviteCodes;
}

export const getAllCreditCodes = async () => {
    const creditCodes = await CreditCode.find().sort({ createdAt: -1 });
    return creditCodes;
}

export const useInviteCode = async (code, userId) => {
    const inviteCode = await InviteCode.findOne({ code });
    if (!inviteCode || !inviteCode.isValid) {
        throw new Error('Invalid invite code');
    }
    if (inviteCode.usedby.includes(userId)) {
        throw new Error('Invite code already used by this user');
    }
    if (inviteCode.usedby.length >= inviteCode.avaliblefor) {
        throw new Error('Invite code usage limit reached');
    }
    inviteCode.usedby.push(userId);
    if (inviteCode.usedby.length >= inviteCode.avaliblefor) {
        inviteCode.isValid = false;
    }
    await inviteCode.save();
    return true;
}

export const useCreditCode = async (code, userId) => {
    const creditCode = await Credit.findOne({ code });
    if (!creditCode || !creditCode.isValid) {
        throw new Error('Invalid credit code');
    }
    if (creditCode.usedBy.includes(userId)) {
        throw new Error('Credit code already used by this user');
    }
    creditCode.usedBy.push(userId);
    if (creditCode.usedBy.length >= 1) {
        creditCode.isValid = false;
    }
    await creditCode.save();

    const user = await User.findById(userId);
    user.credits += creditCode.credits;
    await user.save();

    return true;
}