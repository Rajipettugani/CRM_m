import { Router } from 'express';
import { listRoles } from '../controllers/roleController.js';
import { authRequired, permit } from '../middleware/auth.js';
const router = Router();
router.get('/', authRequired, permit('Admin'), listRoles);
export default router;
