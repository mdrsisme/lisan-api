import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';
import faqRoutes from './faq.route';
import courseRoutes from './course.route';
import moduleRoutes from './module.route';
import lessonRoutes from './lesson.route';
import enrollmentRoutes from './enrollment.routes';
import rankingRoutes from './ranking.routes';
import progressRoutes from './progress.routes';
import streakRoutes from './streak.routes';
import achievementRoutes from './achievement.routes';
import transactionRoutes from './transaction.routes';
import feedbackRoutes from './feedback.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);
router.use('/faqs', faqRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/rankings', rankingRoutes);
router.use('/progress', progressRoutes);
router.use('/streaks', streakRoutes);
router.use('/achievements', achievementRoutes);
router.use('/transactions', transactionRoutes);
router.use('/feedback', feedbackRoutes);

export default router;