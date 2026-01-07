import { Router } from 'express';
import { getUserStats } from '../controllers/stats.controller';

const router = Router();

router.get('/users', getUserStats);

export default router;