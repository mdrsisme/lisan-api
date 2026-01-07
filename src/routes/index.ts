import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';
import rankingRoutes from './ranking.routes';
import progressRoutes from './progress.routes';
import streakRoutes from './streak.routes';
import transactionRoutes from './transaction.routes';
import dictionaryRoutes from './dictionary.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);
router.use('/rankings', rankingRoutes);
router.use('/progress', progressRoutes);
router.use('/streaks', streakRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dictionaries', dictionaryRoutes);

export default router;