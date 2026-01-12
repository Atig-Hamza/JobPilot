import { login, verifyToken } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const loginController = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }
    const { token, safeUser } = await login(email, password);

    res.status(200).json({
        status: 'success',
        data: {
            user: safeUser,
            token
        }
    });
});

export const verifyTokenController = catchAsync(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        throw new AppError('Token is required', 400);
    }
    await verifyToken(token);

    res.status(200).json({
        status: 'success',
        message: 'Token is valid'
    });
});