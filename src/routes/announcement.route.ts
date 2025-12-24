import { Router } from 'express';
import { 
  createAnnouncement, 
  getAnnouncements, 
  getAnnouncementById,
  updateAnnouncement, 
  deleteAnnouncement 
} from '../controllers/announcement.controller';
import { upload } from '../config/cloudinary';
const router = Router();

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'video', maxCount: 1 }
]);

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

router.post('/', uploadFields, createAnnouncement);
router.put('/:id', uploadFields, updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;