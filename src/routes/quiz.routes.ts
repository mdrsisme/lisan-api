import { Router } from 'express';
import * as QuizController from '../controllers/quiz.controller';;

const router = Router();

router.post('/', QuizController.createQuiz);
router.get('/item/:itemId', QuizController.getQuizByItem);
router.delete('/:id', QuizController.deleteQuiz);

export default router;