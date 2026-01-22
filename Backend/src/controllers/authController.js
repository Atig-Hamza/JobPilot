import {
    login,
    verifyToken,
    forgotPassword,
    resetPassword,
    getActiveDevices,
    revokeDevice,
    initiateTwoFactor,
    verifyAndEnableTwoFactor,
    verifyTwoFactorLogin,
    disableTwoFactor
} from '../services/authService.js';
import { AppError } from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { getClientIp } from '../utils/getClientIp.js';

export const loginController = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    const ip = getClientIp(req);
    const location = geoip.lookup(ip) || null;
    const parser = new UAParser(req.headers['user-agent']);
    const device = parser.getResult();

    const result = await login(email, password, {
        ip,
        location,
        device
    });

    if (result.status === '2FA_REQUIRED') {
        return res.status(200).json({
            status: '2FA_REQUIRED',
            message: 'Two-factor authentication required',
            tempToken: result.tempToken
        });
    }

    const { token, safeUser } = result;

    res.status(200).json({
        status: 'success',
        data: { user: safeUser, token }
    });
});

export const verifyTokenController = catchAsync(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        throw new AppError('Token is required', 400);
    }

    const userCredits = await verifyToken(token);

    res.status(200).json({
        status: 'success',
        message: 'Token is valid',
        data: { credits: userCredits }
    });
});

export const forgotPasswordController = catchAsync(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new AppError('Email is required', 400);
    }
    await forgotPassword(email);

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
    });
});

export const resetPasswordController = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
        throw new AppError('Token and password are required', 400);
    }

    await resetPassword(token, password);

    res.status(200).json({
        status: 'success',
        message: 'Password reset successful!'
    });
});

export const getDevicesController = catchAsync(async (req, res) => {
    const devices = await getActiveDevices(req.user.id);
    res.status(200).json({
        status: 'success',
        data: { devices }
    });
});

export const revokeDeviceController = catchAsync(async (req, res) => {
    const { deviceId } = req.params;
    const devices = await revokeDevice(req.user.id, deviceId);
    res.status(200).json({
        status: 'success',
        message: 'Device removed successfully',
        data: { devices }
    });
});

export const initiate2FAController = catchAsync(async (req, res) => {
    const { secret, qrCodeUrl } = await initiateTwoFactor(req.user.id);
    res.status(200).json({
        status: 'success',
        data: { secret, qrCodeUrl }
    });
});

export const verify2FAController = catchAsync(async (req, res) => {
    const { token, code } = req.body;
    const tokenToVerify = token || code;

    if (!tokenToVerify) throw new AppError('Verification code is required', 400);

    const { recoveryCodes } = await verifyAndEnableTwoFactor(req.user.id, tokenToVerify);
    res.status(200).json({
        status: 'success',
        message: 'Two-factor authentication enabled successfully',
        data: { recoveryCodes }
    });
});

export const disable2FAController = catchAsync(async (req, res) => {
    await disableTwoFactor(req.user.id);
    res.status(200).json({
        status: 'success',
        message: 'Two-factor authentication disabled'
    });
});

export const login2FAController = catchAsync(async (req, res) => {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) throw new AppError('Token and code are required', 400);

    const ip = getClientIp(req);
    const location = geoip.lookup(ip) || null;
    const parser = new UAParser(req.headers['user-agent']);
    const device = parser.getResult();

    const { token, safeUser } = await verifyTwoFactorLogin(tempToken, code, {
        ip,
        location,
        device
    });

    res.status(200).json({
        status: 'success',
        data: { user: safeUser, token }
    });
});