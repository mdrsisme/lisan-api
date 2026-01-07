import { Router } from 'express';
import { getDashboardSummary, getMyLearningProgress } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardSummary);
router.get('/learning-path', getMyLearningProgress);

export default router;