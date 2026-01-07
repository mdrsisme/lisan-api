import { Router } from 'express';

import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';

import dictionaryRoutes from './dictionary.routes';
import progressRoutes from './progress.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);

router.use('/dictionary', dictionaryRoutes);
router.use('/progress', progressRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;