// routes/leadRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { leadSubmissionLimiter } from '../middlewares/rateLimiter.js';
import {
    createLead,
    getLeads,
    getLeadById,
    updateLeadStatus,
    updateCounselling,
    updateCoaching,
    updateVisaInfo,
    updateDocumentation,
    addDocument,
    addCommunication,
    addPayment,
    addCustomField,
    assignLead,
    deleteLead,
    getLeadStats,
    updateFullLead
} from '../controller/leadController.js';

const router = express.Router();

// Public route (with rate limiting)
router.post('/submit', leadSubmissionLimiter, createLead);

// All routes below require authentication
router.use(protect);

// Lead statistics (admin and agent)
router.get('/stats', authorizeRoles('admin', 'agent'), getLeadStats);

// Lead CRUD operations
router.get('/', authorizeRoles('admin', 'agent'), getLeads);
router.get('/:id', authorizeRoles('admin', 'agent'), getLeadById);
router.delete('/:id', authorizeRoles('admin'), deleteLead);

// Full lead update (all sections at once)
router.put('/:id/full-update', authorizeRoles('admin', 'agent'), updateFullLead);

// Lead management (admin and assigned agent)
router.put('/:id/status', authorizeRoles('admin', 'agent'), updateLeadStatus);
router.put('/:id/assign', authorizeRoles('admin'), assignLead);

// Pipeline stage updates
router.put('/:id/counselling', authorizeRoles('admin', 'agent'), updateCounselling);
router.put('/:id/coaching', authorizeRoles('admin', 'agent'), updateCoaching);
router.put('/:id/visa', authorizeRoles('admin', 'agent'), updateVisaInfo);
router.put('/:id/documentation', authorizeRoles('admin', 'agent'), updateDocumentation);

// Additional features
router.post('/:id/documents', authorizeRoles('admin', 'agent'), addDocument);
router.post('/:id/communications', authorizeRoles('admin', 'agent'), addCommunication);
router.post('/:id/payments', authorizeRoles('admin', 'agent'), addPayment);
router.post('/:id/custom-fields', authorizeRoles('admin', 'agent'), addCustomField);

export default router;