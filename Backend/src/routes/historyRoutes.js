import express from 'express';
import { getHistoryTitles, deleteHistory, getHistoryByRoom } from '../controllers/historyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); 

router.get('/titles', getHistoryTitles);
router.get('/:roomId', getHistoryByRoom);
router.delete('/:id', deleteHistory);

export default router;
