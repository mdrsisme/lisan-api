import { Router } from 'express';
import { upload } from '../config/cloudinary';
import { 
  createCourse, 
  getAllCourses, 
  getCourseById, 
  updateCourse, 
  deleteCourse,
  getCourseStats
} from '../controllers/course.controller';

const router = Router();

router.post('/', upload.single('thumbnail'), createCourse);
router.get('/stats', getCourseStats);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.put('/:id', upload.single('thumbnail'), updateCourse);
router.delete('/:id', deleteCourse);

export default router;