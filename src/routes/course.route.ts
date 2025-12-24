import { Router } from 'express';
import { upload } from '../config/cloudinary';
import * as CourseController from '../controllers/course.controller';

const router = Router();

router.get('/courses', CourseController.getCourses);
router.get('/courses/:slug', CourseController.getCourseBySlug);
router.post('/courses', upload.single('thumbnail'), CourseController.createCourse);
router.put('/courses/:id', upload.single('thumbnail'), CourseController.updateCourse);

export default router;