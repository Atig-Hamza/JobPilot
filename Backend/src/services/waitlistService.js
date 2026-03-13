import Waitlist from '../models/Waitlist.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendNewJoinWaitlistToAdmins, sendApprovedInviteCodeNotification, sendRejectedInviteCodeNotification, sendWaitlistEmail, sendApprovalNotification } from './mailService.js';
import InviteCode from '../models/inviteCode.js';
import { hasCorrectInviteCode } from './authService.js';

export const addToWaitlist = async (data) => {
    const { email, firstName, lastName } = data;
    const name = `${firstName} ${lastName || ''}`.trim();

    if (!email) {
        throw new AppError('Email is required', 400);
    }

    const existingEntry = await Waitlist.findOne({ email });
    if (existingEntry) {
        throw new AppError('Email is already on the waitlist', 400);
    }

    const sanitizedData = { ...data };

    ['gender', 'dob', 'inviteCode', 'howDidYouFindUs', 'whyJoin'].forEach(field => {
        if (!sanitizedData[field] || sanitizedData[field] === '') {
            delete sanitizedData[field];
        }
    });

    const newEntry = await Waitlist.create(sanitizedData);

    if (data.inviteCode) {
        await hasInviteCode(email, data.inviteCode, name, data.id);
        await hasCorrectInviteCode(name, email, data.password);
        await sendApprovedInviteCodeNotification(email, data.inviteCode, name);
    } else {
        await sendWaitlistEmail({ email, name });
    }

    return newEntry;
};

export const getAllWaitlist = async () => {
    const list = await Waitlist.find().sort({ createdAt: -1 });
    return list;
};

export const approveWaitlistUser = async (waitlistId) => {
    const waitlistEntry = await Waitlist.findById(waitlistId);
    if (!waitlistEntry) {
        throw new AppError('Waitlist entry not found', 404);
    }

    const existingUser = await User.findOne({ email: waitlistEntry.email });
    if (existingUser) {
        throw new AppError('A user with this email already exists', 400);
    }

    const fullName = `${waitlistEntry.firstName} ${waitlistEntry.lastName || ''}`.trim();

    const userData = {
        fullName,
        email: waitlistEntry.email,
        password: waitlistEntry.password,
        authProvider: waitlistEntry.authProvider || 'local',
        isVerified: true,
        role: 'user',
        credits: 500,
    };

    if (waitlistEntry.googleId) userData.googleId = waitlistEntry.googleId;
    if (waitlistEntry.avatar) userData.avatar = waitlistEntry.avatar;

    const newUser = await User.create(userData);

    await sendApprovalNotification(waitlistEntry.email, fullName);

    await Waitlist.findByIdAndDelete(waitlistId);

    return newUser;
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