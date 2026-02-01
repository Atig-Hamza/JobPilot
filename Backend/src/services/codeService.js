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

export const deleteInviteCode = async (id) => {
    await InviteCode.findByIdAndDelete(id);
    return true;
};

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
    const creditCode = await CreditCode.findOne({ code });
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

    return { credits: creditCode.credits, newBalance: user.credits };
}

export const sendCreditsToFriend = async (senderId, recipientEmail, amount) => {
    const sender = await User.findById(senderId);
    if (!sender) {
        throw new Error('Sender not found');
    }

    if (sender.role !== 'admin' && amount > 500) {
        throw new Error('Maximum transfer limit is 500 credits');
    }

    if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    if (sender.credits < amount) {
        throw new Error('Insufficient credits');
    }

    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
    if (!recipient) {
        throw new Error('Recipient not found');
    }

    if (sender._id.equals(recipient._id)) {
        throw new Error('Cannot send credits to yourself');
    }

    sender.credits -= amount;
    recipient.credits += amount;

    await sender.save();
    await recipient.save();

    return {
        sender: {
            id: sender._id,
            fullName: sender.fullName,
            newBalance: sender.credits
        },
        recipient: {
            id: recipient._id,
            fullName: recipient.fullName,
            email: recipient.email,
            newBalance: recipient.credits
        },
        amount
    };
}