import Waitlist from '../models/Waitlist.js';
import { AppError } from '../utils/AppError.js';
import { sendWaitlistEmail } from './mailService.js';

export const addToWaitlist = async (data) => {
    const { email, firstName, lastName } = data;
    const name = `${firstName} ${lastName}`;

    if (!email) {
        throw new AppError('Email is required', 400);
    }

    const existingEntry = await Waitlist.findOne({ email });
    if (existingEntry) {
        throw new AppError('Email is already on the waitlist', 400);
    }

    const newEntry = await Waitlist.create(data);
    
    sendWaitlistEmail({ email, name });

    return newEntry;
};

export const getAllWaitlist = async () => {
    const list = await Waitlist.find().sort({ createdAt: -1 });
    return list;
};
