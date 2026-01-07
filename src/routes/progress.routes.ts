import { Router } from 'express';
import * as LearnController from '../controllers/learning.controller';

const router = Router();

router.get('/due', LearnController.getDueItems);
router.post('/submit', LearnController.submitQuizResult);
router.get('/progress/:dictionaryId', LearnController.getDictionaryProgress);
router.get('/stats', LearnController.getUserStats);

export default router;