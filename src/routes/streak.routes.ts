import { Router } from 'express';
import { 
    getMyStreak, 
    updateStreak, 
    getStreakByUserId, 
    resetStreak,
    getStreakStats
} from '../controllers/streak.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getMyStreak);
router.get('/stats', getStreakStats);
router.get('/:userId', getStreakByUserId);
router.post('/hit', updateStreak);
router.delete('/', resetStreak);

export default router;