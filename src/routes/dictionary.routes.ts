import { Router } from 'express';
import { upload } from '../config/cloudinary';
import * as DictController from '../controllers/dictionary.controller';

const router = Router();

router.get('/', DictController.getAllDictionaries);
router.get('/:id', DictController.getDictionaryById);
router.get('/:dictionaryId/items', DictController.getItemsByDictionary);

router.post('/', upload.single('thumbnail'), DictController.createDictionary);
router.patch('/:id', upload.single('thumbnail'), DictController.updateDictionary);
router.delete('/:id', DictController.deleteDictionary);

router.post('/items', 
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), 
  DictController.createDictionaryItem
);
router.delete('/items/:id', DictController.deleteDictionaryItem);

export default router;