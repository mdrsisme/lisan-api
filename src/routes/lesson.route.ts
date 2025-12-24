import { Router } from 'express';
import { upload } from '../config/cloudinary';
import * as LessonController from '../controllers/lesson.controller';

const router = Router();

router.post('/lessons', upload.single('content'), LessonController.createLesson);
router.put('/lessons/:id', upload.single('content'), LessonController.updateLesson);
router.delete('/lessons/:id', LessonController.deleteLesson);

export default router;