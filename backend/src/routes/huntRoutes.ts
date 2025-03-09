import express, { Router } from 'express';
import { createHunt, getHuntByCode, joinHunt, validateAdmin } from '../controllers/huntController';

const router: Router = express.Router();

router.post('/create', createHunt); // Admin creates hunt (no auth middleware)
router.get('/:code', getHuntByCode); // Participants access hunt
router.post('/join', joinHunt); // Participants join with name
router.post('/validate-admin', validateAdmin); // Validate admin password

export default router;