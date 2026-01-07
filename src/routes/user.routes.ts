import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', upload.single('avatar'), updateUser);
router.delete('/:id', deleteUser);

export default router;