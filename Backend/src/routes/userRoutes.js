import express from 'express';

import { protect } from '../middlewares/authMiddleware.js';
import { updatePasswordController, deleteAccountController } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.patch('/update-password', updatePasswordController);
router.delete('/delete-account', deleteAccountController);

export default router;
