import { Router } from 'express';
import { getMyStreak, updateStreak } from '../controllers/streak.controller';

const router = Router();

router.get('/', getMyStreak);
router.post('/hit', updateStreak);

export default router;