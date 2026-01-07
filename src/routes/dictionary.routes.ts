import express from 'express';
import { upload } from '../config/cloudinary';
import * as DictionaryController from '../controllers/dictionary.controller';

const router = express.Router();

// --- Dictionary (Categories) Routes ---

router.get('/', DictionaryController.getAllDictionaries);

router.get('/:id', DictionaryController.getDictionaryById);

router.post(
    '/', 
    upload.single('thumbnail'), 
    DictionaryController.createDictionary
);

router.patch(
    '/:id', 
    upload.single('thumbnail'), 
    DictionaryController.updateDictionary
);

router.delete('/:id', DictionaryController.deleteDictionary);


// --- Dictionary Items (Words/Content) Routes ---

router.get('/:dictionaryId/items', DictionaryController.getItemsByDictionary);

router.post(
    '/items', 
    upload.fields([
        { name: 'video', maxCount: 1 }, 
        { name: 'image', maxCount: 1 }
    ]), 
    DictionaryController.createDictionaryItem
);

router.patch(
    '/items/:id', 
    upload.fields([
        { name: 'video', maxCount: 1 }, 
        { name: 'image', maxCount: 1 }
    ]), 
    DictionaryController.updateDictionaryItem
);

router.delete('/items/:id', DictionaryController.deleteDictionaryItem);

export default router;