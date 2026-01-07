import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';
import faqRoutes from './faq.route';
// import courseRoutes from './course.route'; // Digantikan Dictionary
// import moduleRoutes from './module.route'; // Digantikan Dictionary
// import lessonRoutes from './lesson.route'; // Digantikan Dictionary
// import enrollmentRoutes from './enrollment.routes'; // Digantikan Dictionary
import rankingRoutes from './ranking.routes';
import progressRoutes from './progressDictionary.routes'; // Pastikan nama file sesuai dengan yang kita buat sebelumnya
import streakRoutes from './streak.routes';
import achievementRoutes from './achievement.routes';
import transactionRoutes from './transaction.routes';
import feedbackRoutes from './feedback.routes';
import dictionaryRoutes from './dictionary.routes'; // Route baru untuk Dictionary

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);
router.use('/faqs', faqRoutes);

// Route lama di-disable agar tidak konflik/bingung
// router.use('/courses', courseRoutes);
// router.use('/modules', moduleRoutes);
// router.use('/lessons', lessonRoutes);
// router.use('/enrollments', enrollmentRoutes);

router.use('/rankings', rankingRoutes);
router.use('/progress', progressRoutes);
router.use('/streaks', streakRoutes);
router.use('/achievements', achievementRoutes);
router.use('/transactions', transactionRoutes);
router.use('/feedback', feedbackRoutes);

// Route Utama Baru
router.use('/dictionaries', dictionaryRoutes);

export default router;