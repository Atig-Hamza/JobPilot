import express from 'express';
import userRoutes from './userRoutes.js';
import llmRoutes from './LLMRoutes.js';
import jopRoutes from './JOPRoutes.js';
import waitlistRoutes from './waitlistRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/llm', llmRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/', jopRoutes);
router.use('/auth', authRoutes);

export default router;
