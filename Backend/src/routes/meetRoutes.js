import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    handleMeetInit,
    handleMeetChat,
    handleMeetTTS,
    handleMeetTransition,
    handleMeetReport,
    handleMeetEnd,
    handleMeetStatus,
} from '../controllers/meetController.js';

const router = express.Router();

router.post('/init', protect, handleMeetInit);
router.post('/chat', protect, handleMeetChat);
router.post('/tts', protect, handleMeetTTS);
router.post('/transition', protect, handleMeetTransition);
router.post('/report', protect, handleMeetReport);
router.post('/end', protect, handleMeetEnd);
router.get('/status/:sessionId', protect, handleMeetStatus);

export default router;
