import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';
import faqRoutes from './faq.route';
import courseRoutes from './course.route';
import moduleRoutes from './module.route';
import lessonRoutes from './lesson.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);
router.use('/faqs', faqRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);

export default router;