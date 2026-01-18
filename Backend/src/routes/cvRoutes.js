import express from 'express';
import { generatePDF } from '../controllers/cvController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generatePDF);

export default router;
