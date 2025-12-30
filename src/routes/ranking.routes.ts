import { Router } from 'express';
import { getLeaderboard } from '../controllers/ranking.controller';

const router = Router();

router.get('/', getLeaderboard);

export default router;