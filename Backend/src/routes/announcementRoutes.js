import express from 'express';
import { createNewAnnouncement, getLatest } from '../controllers/announcementController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

import uploadAnnouncement from '../middlewares/announcementUploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(restrictTo('admin'), uploadAnnouncement.single('image'), createNewAnnouncement);

router.route('/latest')
    .get(getLatest);

export default router;
