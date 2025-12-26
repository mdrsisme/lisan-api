import { Router } from 'express';
import { 
  createEnrollment, 
  getAllEnrollments, 
  getEnrollmentById, 
  updateEnrollment, 
  deleteEnrollment,
  getStatsUsersPerCourse,
  getStatsCoursesPerUser,
  checkEnrollmentStatus 
} from '../controllers/enrollment.controller';

const router = Router();

router.get('/stats/users-per-course', getStatsUsersPerCourse);
router.get('/stats/courses-per-user', getStatsCoursesPerUser);

router.get('/check', checkEnrollmentStatus); 

router.get('/', getAllEnrollments);
router.post('/', createEnrollment);
router.get('/:id', getEnrollmentById);

router.put('/:id', updateEnrollment);

router.delete('/:id', deleteEnrollment);

export default router;