import { Router } from 'express';
import { register, verifyAccount, sendVerificationCode, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/verify', verifyAccount);
router.post('/send-code', sendVerificationCode);
router.post('/login', login);

export default router;