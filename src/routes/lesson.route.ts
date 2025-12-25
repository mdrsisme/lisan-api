import { Router } from 'express';
import { upload } from '../config/cloudinary';
import { 
  createLesson, 
  getAllLessons, 
  getLessonById, 
  updateLesson, 
  deleteLesson,
  getLessonStats
} from '../controllers/lesson.controller';

const router = Router();

router.post('/', upload.single('content'), createLesson);
router.get('/stats', getLessonStats);
router.get('/', getAllLessons);
router.get('/:id', getLessonById);
router.put('/:id', upload.single('content'), updateLesson);
router.delete('/:id', deleteLesson);

export default router;