import { Router } from 'express';
import { 
  getGlobalLeaderboard, 
  getStreakLeaderboard 
} from '../controllers/leaderboard.controller';

const router = Router();

router.get('/global', getGlobalLeaderboard);
router.get('/streak', getStreakLeaderboard);

export default router;