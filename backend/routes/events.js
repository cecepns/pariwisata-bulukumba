// ANCHOR: Public events routes
// Public endpoints for listing events
import { Router } from 'express';
import { getAllEvents } from '../controllers/eventController.js';

const router = Router();

router.get('/', getAllEvents);

export default router;


