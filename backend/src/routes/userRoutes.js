import express from 'express';
import { listUsers, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listUsers);
router.put('/me', protect, updateProfile);

export default router;
