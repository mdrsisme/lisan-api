import { Router } from 'express';
import { 
  addXp, 
  getMyAchievements,
  updateLessonProgress, 
  getUserCourseProgress 
} from '../controllers/progress.controller';

const router = Router();

router.post('/xp/add', addXp);
router.get('/achievements', getMyAchievements);

router.post('/', updateLessonProgress);
router.get('/:user_id/:course_id', getUserCourseProgress);

export default router;