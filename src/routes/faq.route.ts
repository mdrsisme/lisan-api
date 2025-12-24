import { Router } from 'express';
import { 
  createFaq, 
  getAllFaqs, 
  getFaqById, 
  updateFaq, 
  deleteFaq,
  countFaqs 
} from '../controllers/faq.controller';

const router = Router();

router.get('/count', countFaqs);

router.get('/', getAllFaqs);
router.post('/', createFaq);

router.get('/:id', getFaqById);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);

export default router;