import { Router } from 'express';
import { 
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedback.controller';

const router = Router();

router.post('/', createFeedback);
router.get('/', getAllFeedbacks);
router.get('/:id', getFeedbackById);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export default router;