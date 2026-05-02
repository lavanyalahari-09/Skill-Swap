import express from 'express';
import { createSkill, deleteSkill, mySkills } from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, mySkills).post(protect, createSkill);
router.delete('/:id', protect, deleteSkill);

export default router;
