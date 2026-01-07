import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import announcementRoutes from './announcement.route';
const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/announcements', announcementRoutes);

export default router;