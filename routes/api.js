import express from 'express';
import { getHotelStats } from '../controllers/analyticsController.js';
import { handleAIChat } from '../controllers/aiController.js';

const router = express.Router();

router.get('/stats', getHotelStats);
router.post('/chat', handleAIChat);

export default router;