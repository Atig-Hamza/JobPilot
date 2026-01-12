import express from 'express';
import { crawlCompanies } from '../controllers/JOPController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/crawl', protect, crawlCompanies);

export default router;
