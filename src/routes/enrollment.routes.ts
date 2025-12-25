import { Router } from 'express';
import {
    enrollCourse,
    getUserEnrollments,
    checkEnrollmentStatus,
    updateProgress,
    updateStatus,
    getGeneralStats,
    getUserEnrollmentCounts,
    getModuleUserStats
} from '../controllers/enrollment.controller';

const router = Router();

router.post('/', enrollCourse);
router.get('/', getUserEnrollments);
router.get('/check', checkEnrollmentStatus);
router.patch('/:id/progress', updateProgress);
router.patch('/:id/status', updateStatus);
router.get('/general', getGeneralStats);
router.get('/users/top-courses', getUserEnrollmentCounts);
router.get('/modules/top-users', getModuleUserStats);

export default router;