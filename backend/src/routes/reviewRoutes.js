import express from 'express';
import { createReview, userReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:userId', protect, userReviews);

export default router;
