import { Router } from 'express';
import { updateProfile, updatePassword, deleteAccount, getUsers, getUserStats } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

router.put('/profile', authenticate, upload.single('avatar'), updateProfile);
router.put('/password', authenticate, updatePassword);
router.delete('/account', authenticate, deleteAccount);

router.get('/', authenticate, getUsers);
router.get('/stats', authenticate, getUserStats);

export default router;