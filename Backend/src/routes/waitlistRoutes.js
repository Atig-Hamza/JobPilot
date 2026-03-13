import express from 'express';
import * as waitlistController from '../controllers/waitlistController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', waitlistController.joinWaitlist);
router.get('/', protect, restrictTo('admin'), waitlistController.getWaitlist);
router.patch('/:id/approve', protect, restrictTo('admin'), waitlistController.approveUser);

export default router;
