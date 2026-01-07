import { Router } from 'express';
import * as GameController from '../controllers/gamification.controller';

const router = Router();

router.get('/levels', GameController.getLevelBoundaries);
router.get('/leaderboard', GameController.getLeaderboard);
router.get('/streak/:userId', GameController.getUserStreak);

router.post('/streaks', GameController.createStreak);
router.get('/streaks', GameController.getAllStreaks);
router.put('/streaks/:id', GameController.updateStreak);
router.delete('/streaks/:id', GameController.deleteStreak);

export default router;