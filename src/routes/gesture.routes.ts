import { Router } from 'express';
import { logGesture } from '../controllers/gesture.controller';

const router = Router();

router.post('/logs', logGesture);

export default router;