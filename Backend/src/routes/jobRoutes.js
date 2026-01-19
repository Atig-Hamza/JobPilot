import express from 'express';
import { 
    getJobs, 
    getJob, 
    createNewJob, 
    applyJob, 
    generateJobs 
} from '../controllers/jobController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getJobs)
    .post(protect, createNewJob);

router.route('/generate')
    .post(protect, generateJobs);

router.route('/:id')
    .get(getJob);

router.route('/:id/apply')
    .post(protect, applyJob);

export default router;
