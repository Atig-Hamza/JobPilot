import express from 'express';
import { getProfile, upsertProfile, analyzeCV } from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.post('/', upsertProfile);
router.post('/analyze-cv', upload.single('cv'), analyzeCV);

export default router;
