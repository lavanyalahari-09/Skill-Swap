import express from 'express';
import { discoverMatches, mySavedMatches, saveMatch } from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/discover', protect, discoverMatches);
router.route('/').get(protect, mySavedMatches).post(protect, saveMatch);

export default router;
