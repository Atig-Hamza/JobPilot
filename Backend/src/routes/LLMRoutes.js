import express from 'express';
import { handleLLMRequest } from '../controllers/LLMController.js';
import { protect } from '../middlewares/authMiddleware.js';
import aiUpload from '../middlewares/aiUploadMiddleware.js';

const router = express.Router();

router.post('/generate', protect, aiUpload.single('image'), handleLLMRequest);

export default router;
