import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import wastageRoutes from './prowastageRoutes.js';


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', authMiddleware, productRoutes);
router.use('/prowastage', authMiddleware, wastageRoutes);

export default router;