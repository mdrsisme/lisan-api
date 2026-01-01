import { Router } from 'express';
import { 
  createStreak,
  getAllStreaks,
  getUserStreak,
  updateStreak,
  deleteStreak
} from '../controllers/streak.controller';

const router = Router();

router.post('/', createStreak);
router.get('/', getAllStreaks);
router.get('/:user_id', getUserStreak);
router.put('/:id', updateStreak);
router.delete('/:id', deleteStreak);

export default router;