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

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

router.get('/stats', getAnnouncementStats);
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', uploadFields, createAnnouncement);
router.put('/:id', uploadFields, updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;