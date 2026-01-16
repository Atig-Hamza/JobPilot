import { login, verifyToken } from '../services/authService.js';
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

    const { token, safeUser } = await login(email, password, {
        ip,
        location,
        device
    });

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