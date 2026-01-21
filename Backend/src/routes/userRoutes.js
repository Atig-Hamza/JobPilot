import express from 'express';

import { protect } from '../middlewares/authMiddleware.js';
import { updatePasswordController, deleteAccountController } from '../controllers/userController.js';
import { getDevicesController, revokeDeviceController } from '../controllers/authController.js';

const router = express.Router();

router.use(protect);

router.patch('/update-password', updatePasswordController);
router.delete('/delete-account', deleteAccountController);
router.get('/devices', getDevicesController);
router.delete('/devices/:deviceId', revokeDeviceController);

export default router;
