import express from 'express';
import { crawlCompanies } from '../controllers/JOPController.js';

const router = express.Router();

router.post('/crawl', crawlCompanies);

export default router;
