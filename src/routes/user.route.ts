import { Router } from 'express';
import { 
  getUsers, 
  getUserStats, 
  updateUserAccount,
  deleteUserAccount,
  updateMyProfile,
  deleteMyAccount,
  getUserProfile,
  getMyProfile
} from '../controllers/user.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/stats', getUserStats);

router.get('/me', getMyProfile);
router.put('/me', upload.single('avatar'), updateMyProfile);
router.delete('/me', deleteMyAccount);

router.get('/', getUsers);

router.get('/:id', getUserProfile);
router.put('/:id', updateUserAccount);
router.delete('/:id', deleteUserAccount);

export default router;