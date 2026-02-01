import { updatePassword, deleteUser, getNotificationPreferences, updateNotificationPreferences, getAiPersonalization, updateAiPersonalization } from '../services/userService.js';
import { AppError } from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const updatePasswordController = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError('Current and new password are required', 400);
    }

    await updatePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
    });
});

export const deleteAccountController = catchAsync(async (req, res) => {
    await deleteUser(req.user.id);

    res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully'
    });
});

export const getNotificationPreferencesController = catchAsync(async (req, res) => {
    const preferences = await getNotificationPreferences(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { preferences }
    });
});

export const updateNotificationPreferencesController = catchAsync(async (req, res) => {
    const preferences = await updateNotificationPreferences(req.user.id, req.body);

    res.status(200).json({
        status: 'success',
        data: { preferences }
    });
});

export const getAiPersonalizationController = catchAsync(async (req, res) => {
    const settings = await getAiPersonalization(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { settings }
    });
});

export const updateAiPersonalizationController = catchAsync(async (req, res) => {
    const settings = await updateAiPersonalization(req.user.id, req.body);

    res.status(200).json({
        status: 'success',
        data: { settings }
    });
});
