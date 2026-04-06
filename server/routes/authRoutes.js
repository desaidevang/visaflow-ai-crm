
import express from 'express';
import { loginUser, logoutUser } from '../controller/authController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { createUser } from '../controller/userController.js'; 

const router = express.Router();

// Login/Logout routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);


router.post('/create-user', protect, authorizeRoles('admin'), createUser);

export default router;