import { Router } from 'express';
import { 
  getUserProgress, 
  updateProgress, 
  updateStreak 
} from '../controllers/progress.controller';

const router = Router();

router.get('/:userId', getUserProgress);
router.post('/submit', updateProgress);
router.post('/streak/update', updateStreak);

export default router;