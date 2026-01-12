import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

function removeSensitiveInfo(user) {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
}

export const login = async (email, password) => {
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

    return { token, safeUser };
};
