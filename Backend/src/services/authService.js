import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendNewLoginAlert } from './mailService.js';

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

    const safeUser = removeSensitiveInfo(user);

    const expiresIn = user.role === 'admin' ? '7d' : '1h';

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn }
    );
    
    sendNewLoginAlert(user.email, new Date(), loginDetails);

    return { token, safeUser };
};

export const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        if (user.isBanned) {
            throw new AppError('User is banned', 403);
        }
        return true;
    } catch (err) {
        throw new AppError('Invalid or expired token', 401);
    }
};

export const hasCorrectInviteCode = async (fullName, email, password) => {
    const user = await User.findOne({ email });
    if (user) {
        throw new AppError('Email is already registered', 400);
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ fullName, email, password: hashedPassword, credits: 500});
}