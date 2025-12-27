import { Router } from 'express';
import { 
  updateLessonProgress, 
  getUserCourseProgress 
} from '../controllers/progress.controller';

const router = Router();

router.post('/', updateLessonProgress);
router.get('/:user_id/:course_id', getUserCourseProgress);

export default router;