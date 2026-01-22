import express from 'express';

import { protect } from '../middlewares/authMiddleware.js';
import { updatePasswordController, deleteAccountController } from '../controllers/userController.js';
import {
    getDevicesController,
    revokeDeviceController,
    initiate2FAController,
    verify2FAController,
    disable2FAController
} from '../controllers/authController.js';

const router = express.Router();

router.use(protect);

router.patch('/update-password', updatePasswordController);
router.delete('/delete-account', deleteAccountController);
router.get('/devices', getDevicesController);
router.delete('/devices/:deviceId', revokeDeviceController);

router.post('/2fa/setup', initiate2FAController);
router.post('/2fa/verify', verify2FAController);
router.post('/2fa/disable', disable2FAController);

export default router;
