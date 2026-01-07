import { Router } from 'express';
import { 
    getAllDictionaries, 
    createDictionary, 
    getItemsByDictionary, 
    createDictionaryItem 
} from '../controllers/dictionary.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/', getAllDictionaries);
router.get('/:dictionaryId/items', getItemsByDictionary);

router.post('/', upload.single('thumbnail'), createDictionary);
router.post('/items', upload.single('image'), createDictionaryItem);

export default router;