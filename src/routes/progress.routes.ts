import { Router } from 'express';
import { 
    getDashboardSummary, 
    getAllLearningProgress, 
    getProgressByDictionaryId,
    createOrUpdateProgress,
    deleteProgress
} from '../controllers/progress.controller';

const router = Router();

router.get('/dashboard', getDashboardSummary);
router.get('/', getAllLearningProgress);
router.get('/:dictionaryId', getProgressByDictionaryId);
router.post('/', createOrUpdateProgress);
router.delete('/:dictionaryId', deleteProgress);

export default router;