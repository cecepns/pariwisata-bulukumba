// ANCHOR: Public galleries routes
// Public endpoints for listing galleries
import { Router } from 'express';
import { getAllGalleries } from '../controllers/galleryController.js';

const router = Router();

router.get('/', getAllGalleries);

export default router;


