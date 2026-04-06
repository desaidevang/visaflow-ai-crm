import express from 'express';
import { sendMessage, 
    getRecommendations, 
    getUniversities, 
    getVisaInfo  } from '../controller/chatController.js';

const router = express.Router();

router.post('/chat', sendMessage);
router.post('/recommendations', getRecommendations);
router.get('/universities', getUniversities);
router.get('/visa-info', getVisaInfo);

export default router;