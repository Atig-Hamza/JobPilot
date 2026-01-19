import express from 'express';
import userRoutes from './userRoutes.js';
import llmRoutes from './LLMRoutes.js';
import jopRoutes from './JOPRoutes.js';
import waitlistRoutes from './waitlistRoutes.js';
import authRoutes from './authRoutes.js';
import codeRoutes from './codeRoutes.js';
import historyRoutes from './historyRoutes.js';
import profileRoutes from './profileRoutes.js';
import cvRoutes from './cvRoutes.js';
import jobRoutes from './jobRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/cv', cvRoutes);
router.use('/llm', llmRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/', jopRoutes);
router.use('/auth', authRoutes);
router.use('/codes', codeRoutes);
router.use('/history', historyRoutes);
router.use('/jobs', jobRoutes);

export default router;

