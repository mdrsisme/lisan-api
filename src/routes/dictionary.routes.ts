import { Router } from 'express';
import { 
    getAllDictionaries, 
    getDictionaryById,
    createDictionary, 
    updateDictionary,
    deleteDictionary,
    getItemsByDictionary, 
    createDictionaryItem,
    updateDictionaryItem,
    deleteDictionaryItem,
    trackItemProgress
} from '../controllers/dictionary.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/', getAllDictionaries);
router.get('/:id', getDictionaryById);
router.post('/', upload.single('thumbnail'), createDictionary);
router.put('/:id', upload.single('thumbnail'), updateDictionary);
router.delete('/:id', deleteDictionary);

router.get('/:dictionaryId/items', getItemsByDictionary);
router.post('/items', upload.single('image'), createDictionaryItem);
router.put('/items/:itemId', upload.single('image'), updateDictionaryItem);
router.delete('/items/:itemId', deleteDictionaryItem);

router.post('/items/:itemId/progress', trackItemProgress);

export default router;