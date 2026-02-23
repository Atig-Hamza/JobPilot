import express from 'express';
import { handleLLMRequest, handleGenerationStatus } from '../controllers/LLMController.js';
import { protect } from '../middlewares/authMiddleware.js';
import aiUpload from '../middlewares/aiUploadMiddleware.js';

const router = express.Router();

router.post('/generate', protect, aiUpload.single('image'), handleLLMRequest);
router.get('/status/:roomId', protect, handleGenerationStatus);

export default router;
