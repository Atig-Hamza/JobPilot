import { useCreditCode, generateCreditCode, generateInviteCode, getAllInviteCodes, deleteInviteCode as deleteInviteCodeService, sendCreditsToFriend } from "../services/codeService.js";
import { sendCreditsReceivedEmail } from "../services/mailService.js";
import User from "../models/User.js";

export async function createInviteCode(req, res) {
    try {
        const { code, availableFor, expiresAt } = req.body;
        const newInviteCode = await generateInviteCode(code, availableFor, expiresAt);
        res.status(201).json(newInviteCode);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getInviteCodes(req, res) {
    try {
        const inviteCodes = await getAllInviteCodes();
        res.status(200).json(inviteCodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteInviteCode(req, res) {
    try {
        const { id } = req.params;
        await deleteInviteCodeService(id);
        res.status(200).json({ message: 'Invite code deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createCreditCode(req, res) {
    try {
        const { code, credits } = req.body;
        const newCreditCode = await generateCreditCode(code, credits);
        res.status(201).json(newCreditCode);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function redeemCreditCode(req, res) {
    try {
        const { code } = req.body;
        const userId = req.user.id;
        const result = await useCreditCode(code, userId);
        res.status(200).json({
            message: 'Credit code redeemed successfully',
            credits: result.credits,
            newBalance: result.newBalance
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function sendCredits(req, res) {
    try {
        const { recipientEmail, amount } = req.body;
        const senderId = req.user.id;

        if (!recipientEmail || !amount) {
            return res.status(400).json({ message: 'Recipient email and amount are required' });
        }

        const result = await sendCreditsToFriend(senderId, recipientEmail, parseInt(amount));

        const recipient = await User.findOne({ email: recipientEmail });
        if (recipient?.notificationPreferences?.system !== false) {
            sendCreditsReceivedEmail(
                result.recipient.email,
                result.recipient.fullName,
                result.sender.fullName,
                result.amount
            );
        }

        res.status(200).json({
            message: `Successfully sent ${result.amount} credits to ${result.recipient.fullName}`,
            newBalance: result.sender.newBalance
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}