import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getItemsByCategory,
  createSignItem,
  updateSignItem,
  deleteSignItem
} from '../controllers/dictionary.controller';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/items/:categoryId', getItemsByCategory);
router.post('/items', createSignItem);
router.put('/items/:id', updateSignItem);
router.delete('/items/:id', deleteSignItem);

export default router;