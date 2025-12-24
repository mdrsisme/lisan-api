import { Router } from 'express';
import { 
  createAnnouncement, 
  getAllAnnouncements, 
  searchAnnouncements,
  countAnnouncements,
  getAnnouncementById,
  updateAnnouncement, 
  deleteAnnouncement 
} from '../controllers/announcement.controller';
import { upload } from '../config/cloudinary';

const router = Router();
const uploadFields = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]);

router.get('/search', searchAnnouncements);
router.get('/count', countAnnouncements);

router.get('/', getAllAnnouncements);
router.post('/', uploadFields, createAnnouncement);

router.get('/:id', getAnnouncementById);
router.put('/:id', uploadFields, updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;