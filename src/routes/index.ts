import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import statsRoutes from './stats.routes';
import announcementRoutes from './announcement.routes';
import gamificationRoutes from './gamification.routes';
import dictionaryRoutes from './dictionary.routes';
import streakRoutes from './streak.routes';
import progressRoutes from './progress.routes';
import gestureRoutes from './gesture.routes';
import questRoutes from './quest.routes';
import aiModelRoutes from './aiModel.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stats', statsRoutes);
router.use('/announcements', announcementRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/dictionaries', dictionaryRoutes);
router.use('/streaks', streakRoutes);
router.use('/progress', progressRoutes);
router.use('/gestures', gestureRoutes);
router.use('/quests', questRoutes);
router.use('/ai-models', aiModelRoutes);

export default router;