import express from 'express';
import { handleYouTubeSearch, handleImageSearch } from '../controllers/mediaController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/youtube', protect, handleYouTubeSearch);
router.get('/images', protect, handleImageSearch);

export default router;
