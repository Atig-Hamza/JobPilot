import Waitlist from '../models/Waitlist.js';
import { AppError } from '../utils/AppError.js';
import { sendNewJoinWaitlistToAdmins, sendApprovedInviteCodeNotification, sendRejectedInviteCodeNotification, sendWaitlistEmail } from './mailService.js';
import InviteCode from '../models/inviteCode.js';
import { hasCorrectInviteCode } from './authService.js';

export const addToWaitlist = async (data) => {
    const { email, firstName, lastName } = data;
    const name = `${firstName} ${lastName}`;

    if (!email) {
        throw new AppError('Email is required', 400);
    }

    const existingEntry = await Waitlist.findOne({ email });
    if (existingEntry) {
        throw new AppError('Email is already on the waitlist', 400);
    }

    const newEntry = await Waitlist.create(data);

    if (data.inviteCode) {
        await hasInviteCode(email, data.inviteCode, name, data.id);
    }
    
    if (!data.inviteCode) {
        sendWaitlistEmail({ email, name });
    }
    
    await hasCorrectInviteCode(name, email, data.password);
    await sendApprovedInviteCodeNotification(email, data.inviteCode, name);

    return newEntry;
};

export const getAllWaitlist = async () => {
    const list = await Waitlist.find().sort({ createdAt: -1 });
    return list;
};

export const hasInviteCode = async (userEmail, code, fullName, userId) => {
    const upCode = code.toUpperCase();
    const inviteCode = await InviteCode.findOne({ code: upCode });
    if (!inviteCode) {
        await sendRejectedInviteCodeNotification(userEmail, code, fullName);
        throw new AppError('Invalid invite code', 400);
    }
    if (!inviteCode.isValid) {
        await sendRejectedInviteCodeNotification(userEmail, code, fullName);
        throw new AppError('Invite code is no longer valid', 400);
    }
    if (inviteCode.expiresAt < new Date()) {
        await sendRejectedInviteCodeNotification(userEmail, code, fullName);
        throw new AppError('Invite code has expired', 400);
    }

    inviteCode.usedby.push(userId);

    if (inviteCode.usedby.length >= inviteCode.avaliblefor) {
        inviteCode.isValid = false;
    }
    await inviteCode.save();
};