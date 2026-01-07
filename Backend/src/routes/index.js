import express from 'express';
import userRoutes from './userRoutes.js';
import llmRoutes from './LLMRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/llm', llmRoutes);

export default router;
