import express from 'express';
import userRoutes from './userRoutes.js';
import llmRoutes from './LLMRoutes.js';
import jopRoutes from './JOPRoutes.js';
import waitlistRoutes from './waitlistRoutes.js';
import authRoutes from './authRoutes.js';
import codeRoutes from './codeRoutes.js';
import historyRoutes from './historyRoutes.js';
import profileRoutes from './profileRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/llm', llmRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/', jopRoutes);
router.use('/auth', authRoutes);
router.use('/codes', codeRoutes);
router.use('/history', historyRoutes);

export default router;
