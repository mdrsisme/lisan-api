import { Router } from 'express';
import { register, login, sendOtp, verifyCode } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify', verifyCode);

export default router;