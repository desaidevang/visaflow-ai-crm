// routes/dashboardRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
    getDashboardStats,
    getAgentPerformance,
    getLeadAnalytics,
    getRecentActivities
} from '../controller/dashboardController.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Main dashboard statistics
router.get('/stats', authorizeRoles('admin', 'agent'), getDashboardStats);

// Agent performance metrics (admin only)
router.get('/agent-performance', authorizeRoles('admin'), getAgentPerformance);

// Detailed lead analytics
router.get('/lead-analytics', authorizeRoles('admin', 'agent'), getLeadAnalytics);

// Recent activities feed
router.get('/activities', authorizeRoles('admin', 'agent'), getRecentActivities);

export default router;