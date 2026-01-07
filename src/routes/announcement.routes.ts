import { Router } from 'express';
import { 
  createAnnouncement, 
  getAllAnnouncements, 
  getAnnouncementById, 
  updateAnnouncement, 
  deleteAnnouncement,
  getAnnouncementStats 
} from '../controllers/announcement.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/stats', getAnnouncementStats);
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', upload.single('image'), createAnnouncement);
router.patch('/:id', upload.single('image'), updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;