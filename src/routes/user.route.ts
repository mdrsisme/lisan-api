import { Router } from 'express';
import { 
  createUser,
  getUsers, 
  getUserStats, 
  updateUserAccount,
  deleteUserAccount,
  updateMyProfile,
  deleteMyAccount,
  getUserProfile
} from '../controllers/user.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/stats', getUserStats);

router.put('/me', upload.single('avatar'), updateMyProfile);
router.delete('/me', deleteMyAccount);

router.get('/', getUsers);
router.post('/', createUser);

router.put('/:id', updateUserAccount);
router.delete('/:id', deleteUserAccount);

router.get('/profile/:id', getUserProfile);

export default router;