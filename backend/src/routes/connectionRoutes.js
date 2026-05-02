import express from 'express';
import {
  disconnectConnection,
  myConnections,
  requestConnection,
  updateConnectionStatus
} from '../controllers/connectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, myConnections).post(protect, requestConnection);
router.put('/:id', protect, updateConnectionStatus);
router.delete('/:id', protect, disconnectConnection);

export default router;
