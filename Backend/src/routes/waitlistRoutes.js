import express from 'express';
import * as waitlistController from '../controllers/waitlistController.js';

const router = express.Router();

router.post('/', waitlistController.joinWaitlist);
router.get('/', waitlistController.getWaitlist);

export default router;
