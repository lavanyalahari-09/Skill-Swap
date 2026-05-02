import express from 'express';
import {
  conversation,
  markConversationRead,
  sendMessage
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:userId', protect, conversation);
router.put('/:userId/read', protect, markConversationRead);

export default router;
