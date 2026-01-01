import { Router } from 'express';
import { 
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  grantAchievementToUser,
  getUserAchievements,
  revokeUserAchievement
} from '../controllers/achievement.controller';

const router = Router();

// Master Data Achievements
router.post('/', createAchievement);
router.get('/', getAllAchievements);
router.get('/:id', getAchievementById);
router.put('/:id', updateAchievement);
router.delete('/:id', deleteAchievement);

// User Relations
router.post('/grant', grantAchievementToUser);
router.get('/user/:user_id', getUserAchievements);
router.delete('/revoke/:id', revokeUserAchievement);

export default router;