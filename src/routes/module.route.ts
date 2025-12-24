import { Router } from 'express';
import { upload } from '../config/cloudinary';
import * as ModuleController from '../controllers/module.controller';

const router = Router();
router.post('/modules', ModuleController.createModule);
router.put('/modules/:id', ModuleController.updateModule);
router.delete('/modules/:id', ModuleController.deleteModule);

export default router;