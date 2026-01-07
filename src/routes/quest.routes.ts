import { Router } from 'express';
import { getDailyQuests, claimQuestReward, createDailyQuest } from '../controllers/quest.controller';

const router = Router();

router.get('/daily', getDailyQuests);
router.post('/:userQuestId/claim', claimQuestReward);

router.post('/', createDailyQuest);

export default router;