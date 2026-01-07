import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';
import transactionRoutes from './transaction.routes';
import dictionaryRoutes from './dictionary.routes';
import learningRoutes from './learning.routes';
import gamificationRoutes from './gamification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);
router.use('/transactions', transactionRoutes);

// Module Baru
router.use('/dictionaries', dictionaryRoutes);
router.use('/learning', learningRoutes);         // Menggantikan progress
router.use('/gamification', gamificationRoutes); // Menggantikan rankings & streaks

export default router;