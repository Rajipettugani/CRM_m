import { Router } from 'express';
import { login, register, listUsers } from '../controllers/authController.js';
import { authRequired, permit } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', authRequired, permit('Admin','Sales Head'), register);
router.get('/users', authRequired, permit('Admin','Sales Head'), listUsers);

export default router;
