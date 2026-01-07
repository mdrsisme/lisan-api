import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';
// import courseRoutes from './course.route'; // Digantikan Dictionary
// import moduleRoutes from './module.route'; // Digantikan Dictionary
// import lessonRoutes from './lesson.route'; // Digantikan Dictionary
// import enrollmentRoutes from './enrollment.routes'; // Digantikan Dictionary
import rankingRoutes from './ranking.routes';
import progressRoutes from './progressDictionary.routes';
import streakRoutes from './streak.routes';
import transactionRoutes from './transaction.routes';
import dictionaryRoutes from './dictionary.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);

// Route lama di-disable agar tidak konflik/bingung
// router.use('/courses', courseRoutes);
// router.use('/modules', moduleRoutes);
// router.use('/lessons', lessonRoutes);
// router.use('/enrollments', enrollmentRoutes);

router.use('/rankings', rankingRoutes);
router.use('/progress', progressRoutes);
router.use('/streaks', streakRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dictionaries', dictionaryRoutes);

export default router;