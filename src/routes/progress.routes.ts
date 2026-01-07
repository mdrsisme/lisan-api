import express from 'express';
import * as ProgressController from '../controllers/progress.controller';

const router = express.Router();

router.get('/stats', ProgressController.getUserStats);
router.get('/', ProgressController.getAllProgress);
router.get('/:dictionaryId', ProgressController.getDictionaryProgress);

router.post('/item', ProgressController.toggleItemProgress);
router.post('/reset', ProgressController.resetProgress);

export default router;