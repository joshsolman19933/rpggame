import express from 'express';
import { registerUser, authUser, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = express.Router();

// Nyilvános útvonalak
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), authUser);

// Védett útvonalak
router.route('/profile').get(protect, getUserProfile);

export default router;
