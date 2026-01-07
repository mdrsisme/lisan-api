import { Router } from 'express';
import { getLeaderboard, getLevels } from '../controllers/gamification.controller';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/levels', getLevels);

export default router;