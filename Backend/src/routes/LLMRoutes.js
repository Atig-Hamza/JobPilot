import express from 'express';
import { handleLLMRequest } from '../controllers/LLMController.js';

const router = express.Router();

router.post('/generate', handleLLMRequest);

export default router;
