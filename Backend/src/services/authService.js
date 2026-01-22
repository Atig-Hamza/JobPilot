import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendNewLoginAlert, sendPasswordResetEmail, sendPasswordResetSuccessEmail, send2FAEnabledEmail, sendLoginOTPEmail } from './mailService.js';

function removeSensitiveInfo(user) {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.twoFactorSecret;
    delete userObj.twoFactorRecoveryCodes;
    return userObj;
}

const finalizeLogin = async (user, loginDetails) => {
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

    const emailSent = await sendNewLoginAlert(user.email, new Date(), loginDetails);

    return { token, safeUser };
};

export const login = async (email, password, loginDetails) => {
    const user = await User.findOne({ email }).select('+twoFactorSecret');

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

    if (user.isTwoFactorEnabled) {
        const tempToken = jwt.sign({ id: user._id, role: '2fa_pending' }, process.env.JWT_SECRET, { expiresIn: '10m' });
        return { status: '2FA_REQUIRED', tempToken };
    }

    return finalizeLogin(user, loginDetails);
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

export const initiateTwoFactor = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const secret = speakeasy.generateSecret({ name: `JobPilot (${user.email})` });

    user.twoFactorSecret = secret.base32;
    await user.save({ validateBeforeSave: false });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return { secret: secret.base32, qrCodeUrl };
};

export const verifyAndEnableTwoFactor = async (userId, token) => {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) throw new AppError('User not found', 404);

    const secret = user.twoFactorSecret ? user.twoFactorSecret.trim() : '';
    const cleanToken = token ? token.trim() : '';

    // Check 1: Standard
    let verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: cleanToken,
        window: 6
    });

    // Check 2: -1 Hour
    if (!verified) {
        const minusOneHour = Math.floor(Date.now() / 1000) - 3600;
        verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: cleanToken,
            time: minusOneHour,
            window: 10
        });
    }

    // Check 3: +1 Hour
    if (!verified) {
        const plusOneHour = Math.floor(Date.now() / 1000) + 3600;
        verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: cleanToken,
            time: plusOneHour,
            window: 10
        });
    }

    if (!verified) throw new AppError('Invalid token', 400);

    user.isTwoFactorEnabled = true;

    const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
    const hashedCodes = await Promise.all(recoveryCodes.map(code => bcrypt.hash(code, 12)));

    user.twoFactorRecoveryCodes = hashedCodes;
    await user.save({ validateBeforeSave: false });

    await send2FAEnabledEmail(user.email, user.fullName);

    return { recoveryCodes };
};

export const verifyTwoFactorLogin = async (tempToken, code, loginDetails) => {
    let decoded;
    try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError('Invalid or expired session', 401);
    }

    if (decoded.role !== '2fa_pending') throw new AppError('Invalid session type', 401);

    const user = await User.findById(decoded.id).select('+twoFactorSecret +twoFactorRecoveryCodes +loginOTP +loginOTPExpires');
    if (!user) throw new AppError('User not found', 404);

    let isValid = false;
    let isRecovery = false;

    if (code.length === 6 && /^\d+$/.test(code)) {
        const cleanToken = code.trim();
        // Check 1: Standard
        isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: cleanToken,
            window: 6
        });

        // Check 2: -1 Hour
        if (!isValid) {
            const minusOneHour = Math.floor(Date.now() / 1000) - 3600;
            isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: cleanToken,
                time: minusOneHour,
                window: 10
            });
        }

        // Check 3: +1 Hour
        if (!isValid) {
            const plusOneHour = Math.floor(Date.now() / 1000) + 3600;
            isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: cleanToken,
                time: plusOneHour,
                window: 10
            });
        }

        // Check 4: Email OTP (if TOTP failed)
        if (!isValid) {
            if (user.loginOTP && user.loginOTPExpires && user.loginOTPExpires > Date.now()) {
                const isMatch = await bcrypt.compare(cleanToken, user.loginOTP);

                if (isMatch) {
                    isValid = true;
                    console.log('[OTP DEBUG] OTP Validated Successfully!');
                    user.loginOTP = undefined;
                    user.loginOTPExpires = undefined;
                    await user.save({ validateBeforeSave: false });
                }
            } else {
                console.log('[OTP DEBUG] OTP missing or expired.');
            }
        }
    } else {
        if (user.twoFactorRecoveryCodes && user.twoFactorRecoveryCodes.length > 0) {
            for (const hashedCode of user.twoFactorRecoveryCodes) {
                if (await bcrypt.compare(code, hashedCode)) {
                    isValid = true;
                    isRecovery = true;
                    user.twoFactorRecoveryCodes = user.twoFactorRecoveryCodes.filter(c => c !== hashedCode);
                    break;
                }
            }
        }
    }

    if (!isValid) throw new AppError('Invalid code', 401);

    if (isRecovery) {
        await user.save({ validateBeforeSave: false });
    }

    return finalizeLogin(user, loginDetails);
};

export const disableTwoFactor = async (userId) => {
    const user = await User.findById(userId);
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorRecoveryCodes = undefined;
    await user.save({ validateBeforeSave: false });
};

export const generateAndSendLoginOTP = async (tempToken) => {
    let decoded;
    try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError('Invalid or expired session', 401);
    }

    if (decoded.role !== '2fa_pending') throw new AppError('Invalid session type', 401);

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User not found', 404);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedCode = await bcrypt.hash(code, 12);

    user.loginOTP = hashedCode;
    user.loginOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendLoginOTPEmail(user.email, code, user.fullName);

    return { message: 'Code sent to email' };
};