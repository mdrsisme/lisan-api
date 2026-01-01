import { Router } from 'express';
import { 
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getUserTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/transaction.controller';

const router = Router();

router.post('/', createTransaction);
router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.get('/user/:user_id', getUserTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;