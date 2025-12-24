import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';
import courseRoutes from './course.route';
import moduleRoutes from './module.route';
import lessonRoutes from './lesson.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);
router.use('/course', courseRoutes);
router.use('/module', moduleRoutes);
router.use('/lesson', lessonRoutes);

export default router;