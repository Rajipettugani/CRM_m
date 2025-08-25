import { Router } from 'express';
import { authRequired, permit } from '../middleware/auth.js';
import { createTeam, listTeams, addMembers, setLead } from '../controllers/teamController.js';

const router = Router();

router.post('/', authRequired, permit('Admin','Sales Head','Sales Head Manager'), createTeam);
router.get('/', authRequired, listTeams);
router.post('/:id/members', authRequired, permit('Admin','Sales Head'), addMembers);
router.post('/:id/lead', authRequired, permit('Admin','Sales Head'), setLead);

export default router;
