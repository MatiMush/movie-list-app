import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, getFriends, addFriendByEmail } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authLimiter, authenticateToken, getMe);
router.get('/friends', authLimiter, authenticateToken, getFriends);
router.post('/friends/add', authLimiter, authenticateToken, addFriendByEmail);

export default router;