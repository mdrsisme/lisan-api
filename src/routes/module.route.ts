import { Router } from 'express';
import { upload } from '../config/cloudinary';
import { 
  createModule, 
  getAllModules, 
  getModuleStats,
  getModuleById, 
  updateModule, 
  deleteModule 
} from '../controllers/module.controller';

const router = Router();

router.post('/', upload.single('thumbnail'), createModule);
router.get('/stats', getModuleStats);
router.get('/', getAllModules);
router.get('/:id', getModuleById);
router.put('/:id', upload.single('thumbnail'), updateModule);
router.delete('/:id', deleteModule);

export default router;