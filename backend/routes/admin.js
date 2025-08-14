// ANCHOR: Admin routes (JWT protected)
// Provides admin login and protected CRUD endpoints for attractions, events, and galleries.
import { Router } from 'express';
import { login } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getAllAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
} from '../controllers/attractionController.js';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import {
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
} from '../controllers/galleryController.js';
import { getAllCategories } from '../controllers/categoryController.js';
import { uploadImage, handleImageUpload } from '../controllers/uploadController.js';

const router = Router();

// Auth
router.post('/login', login);

// Protected content management
router.use(requireAuth);

// Attractions
router.get('/attractions', getAllAttractions);
router.get('/attractions/:id', getAttractionById);
router.post('/attractions', createAttraction);
router.put('/attractions/:id', updateAttraction);
router.delete('/attractions/:id', deleteAttraction);

// Events
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Categories
router.get('/categories', getAllCategories);

// Upload
router.post('/upload-image', uploadImage, handleImageUpload);

// Galleries
router.get('/galleries', getAllGalleries);
router.get('/galleries/:id', getGalleryById);
router.post('/galleries', createGallery);
router.put('/galleries/:id', updateGallery);
router.delete('/galleries/:id', deleteGallery);

export default router;


