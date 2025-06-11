import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import villageRoutes from './villageRoutes';
import healthCheckRoutes from './healthCheck';

const router = Router();

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/villages', villageRoutes);
router.use('/api/health', healthCheckRoutes);

export default router;
