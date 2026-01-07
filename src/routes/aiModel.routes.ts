import { Router } from 'express';
import { 
  getAllAiModels, 
  getAiModelById, 
  createAiModel, 
  updateAiModel, 
  deleteAiModel 
} from '../controllers/aiModel.controller';

const router = Router();

router.get('/', getAllAiModels);
router.get('/:id', getAiModelById);
router.post('/', createAiModel);
router.put('/:id', updateAiModel);
router.delete('/:id', deleteAiModel);

export default router;