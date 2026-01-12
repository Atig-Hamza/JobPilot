import express from 'express';
import { handleLLMRequest } from '../controllers/LLMController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, handleLLMRequest);

export default router;
