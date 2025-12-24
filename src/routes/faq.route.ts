import { Router } from 'express';
import { 
  createFaq, 
  getFaqs, 
  getFaqById, 
  updateFaq, 
  deleteFaq 
} from '../controllers/faq.controller';

const router = Router();

router.get('/', getFaqs);
router.get('/:id', getFaqById);

router.post('/', createFaq);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);

export default router;