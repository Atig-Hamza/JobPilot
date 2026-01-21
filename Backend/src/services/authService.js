import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendNewLoginAlert, sendPasswordResetEmail, sendPasswordResetSuccessEmail } from './mailService.js';

function removeSensitiveInfo(user) {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
}

export const login = async (email, password, loginDetails) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    if (user.isBanned) {
        throw new AppError('Your account has been banned. Please contact support.', 403);
    }

    const expiresIn = user.role === 'admin' ? '7d' : '1h';

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn }
    );

    const deviceInfo = loginDetails.device ?
        `${loginDetails.device.browser.name || 'Unknown Browser'} on ${loginDetails.device.os.name || 'Unknown OS'}` :
        'Unknown Device';

    const locationStr = loginDetails.location ?
        `${loginDetails.location.city}, ${loginDetails.location.country}` :
        'Unknown Location';

    user.lastLogin = Date.now();

    user.loginHistory.push({
        ip: loginDetails.ip || 'Unknown IP',
        location: locationStr,
        timestamp: Date.now()
    });
    if (user.loginHistory.length > 50) user.loginHistory.shift();

    user.AllLoginDevices.push({
        ip: loginDetails.ip || 'Unknown IP',
        location: locationStr,
        accessToken: token,
        timestamp: Date.now(),
        deviceInfo
    });

    await user.save();

    const safeUser = removeSensitiveInfo(user);

    sendNewLoginAlert(user.email, new Date(), loginDetails);

    return { token, safeUser };
};

export const getActiveDevices = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return user.AllLoginDevices;
};

export const revokeDevice = async (userId, deviceId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.AllLoginDevices = user.AllLoginDevices.filter(d => d._id.toString() !== deviceId);
    await user.save();

    return user.AllLoginDevices;
};

export const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        const isDeviceActive = user.AllLoginDevices && user.AllLoginDevices.some(device => device.accessToken === token);
        if (!isDeviceActive) {
            throw new AppError('This session has been revoked/logged out. Please log in again.', 401);
        }
        if (user.isBanned) {
            throw new AppError('User is banned', 403);
        }
        user.lastActivity = Date.now();
        await user.save({ validateBeforeSave: false });

        const userCredits = user.credits;
        return userCredits;
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError('Invalid or expired token', 401);
    }
};

export const hasCorrectInviteCode = async (fullName, email, password) => {
    const user = await User.findOne({ email });
    if (user) {
        throw new AppError('Email is already registered', 400);
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ fullName, email, password: hashedPassword, credits: 500 });
};

export const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('There is no user with that email address.', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `https://myjobpilot.app/reset-password/${resetToken}`;

    try {
        await sendPasswordResetEmail(user.email, resetUrl, user.fullName);
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError('There was an error sending the email. Try again later!', 500);
    }
};

export const resetPassword = async (token, newPassword) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastPasswordReset = Date.now();
    await user.save();

    await sendPasswordResetSuccessEmail(user.email, user.fullName);
};