import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  getCounsellors

} from '../controller/userController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Current user routes (any authenticated user)
router.get('/me', getCurrentUser);
router.put('/me', updateCurrentUser);
// Get counsellors (agents with counselling department)
router.get('/counsellors', authorizeRoles('admin', 'agent'), getCounsellors);
// Admin only routes (CRUD operations)
router.get('/', authorizeRoles('admin', 'agent'), getUsers);  // Admin & Agent can view
router.get('/:id', authorizeRoles('admin', 'agent'), getUserById);  // Admin & Agent can view
router.post('/', authorizeRoles('admin'), createUser);  // Only Admin can create
router.put('/:id', authorizeRoles('admin'), updateUser);  // Only Admin can update
router.delete('/:id', authorizeRoles('admin'), deleteUser);  // Only Admin can delete

export default router;