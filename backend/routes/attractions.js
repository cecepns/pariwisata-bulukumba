// ANCHOR: Public attractions routes
// Public endpoints for listing and viewing attractions
import { Router } from 'express';
import { getAllAttractions, getAttractionById } from '../controllers/attractionController.js';

const router = Router();

router.get('/', getAllAttractions);
router.get('/:id', getAttractionById);

export default router;


