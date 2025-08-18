// ANCHOR: Complete Backend Server for Bulukumba Tourism API
// All backend logic in one file - routes, controllers, middleware, and database operations
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { pool, query } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve static files (uploaded images)
router.use('/uploads', express.static(path.join(__dirname, 'uploads-bulukumba-wisata')));

// Upload configuration
const uploadsDir = path.join(__dirname, './uploads-bulukumba-wisata');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Authentication middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// ===== REVIEW BUSINESS LOGIC =====

// Validate review input
function validateReviewInput(reviewData) {
  const errors = [];
  
  // Rating validation: 1.0 - 5.0 dengan increment 0.5
  if (!reviewData.rating || reviewData.rating < 1.0 || reviewData.rating > 5.0) {
    errors.push('Rating harus antara 1.0 - 5.0');
  }
  
  // Check if rating is in 0.5 increments
  if (reviewData.rating % 0.5 !== 0) {
    errors.push('Rating harus dalam kelipatan 0.5');
  }
  
  // Nama reviewer validation: wajib, maksimal 150 karakter
  if (!reviewData.nama_reviewer || reviewData.nama_reviewer.trim() === '') {
    errors.push('Nama reviewer wajib diisi');
  } else if (reviewData.nama_reviewer.length > 150) {
    errors.push('Nama reviewer maksimal 150 karakter');
  }
  
  // Email validation: opsional, jika diisi harus valid
  if (reviewData.email_reviewer && reviewData.email_reviewer.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewData.email_reviewer)) {
      errors.push('Format email tidak valid');
    }
  }
  
  // Komentar validation: maksimal 1000 karakter
  if (reviewData.komentar && reviewData.komentar.length > 1000) {
    errors.push('Komentar maksimal 1000 karakter');
  }
  
  return errors;
}

// Determine review status based on rating and comment
function determineReviewStatus(rating, komentar) {
  // Kata kunci spam yang akan trigger manual review
  const spamKeywords = [
    'spam', 'scam', 'fake', 'terrible', 'awful', 'horrible',
    'worst', 'bad', 'sucks', 'garbage', 'waste'
  ];
  
  // Cek apakah komentar mengandung kata kunci spam
  const hasSpamKeywords = spamKeywords.some(keyword => 
    komentar && komentar.toLowerCase().includes(keyword)
  );
  
  // Auto-approval: rating 3-5 dan tidak ada kata spam
  if (rating >= 3.0 && !hasSpamKeywords) {
    return 'approved';
  }
  
  // Manual review: rating 1-2 atau ada kata spam
  return 'pending';
}

// Update wisata rating statistics
async function updateWisataRating(id_wisata) {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating
      FROM review 
      WHERE id_wisata = ? AND status = 'approved'
    `, [id_wisata]);
    
    const totalReviews = stats[0].total_reviews || 0;
    const averageRating = parseFloat(stats[0].average_rating || 0).toFixed(2);
    
    await query(`
      UPDATE wisata 
      SET average_rating = ?, total_reviews = ?
      WHERE id_wisata = ?
    `, [averageRating, totalReviews, id_wisata]);
    
    return { total_reviews: totalReviews, average_rating: averageRating };
  } catch (error) {
    console.error('Error updating wisata rating:', error);
    throw error;
  }
}

// ===== CONTROLLERS =====

// Review Controllers
async function createReview(req, res) {
  try {
    const { id_wisata, nama_reviewer, email_reviewer, rating, komentar } = req.body;
    
    // Validasi input
    const validationErrors = validateReviewInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validasi gagal', 
        errors: validationErrors 
      });
    }
    
    // Cek apakah wisata exists
    const wisata = await query('SELECT id_wisata FROM wisata WHERE id_wisata = ?', [id_wisata]);
    if (!wisata || wisata.length === 0) {
      return res.status(404).json({ message: 'Wisata tidak ditemukan' });
    }
    
    // Determine review status
    const status = determineReviewStatus(rating, komentar);
    
    // Save review ke database
    const result = await query(`
      INSERT INTO review (id_wisata, nama_reviewer, email_reviewer, rating, komentar, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id_wisata,
      nama_reviewer.trim(),
      email_reviewer ? email_reviewer.trim() : null,
      rating,
      komentar ? komentar.trim() : null,
      status
    ]);
    
    // Update wisata rating jika review approved
    if (status === 'approved') {
      await updateWisataRating(id_wisata);
    }
    
    res.status(201).json({
      message: status === 'approved' ? 'Review berhasil ditambahkan' : 'Review sedang dalam moderasi',
      data: {
        id_review: result.insertId,
        status: status
      }
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}

async function getReviewsByWisata(req, res) {
  try {
    const { id_wisata } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get reviews
    const reviews = await query(`
      SELECT id_review, nama_reviewer, rating, komentar, created_at
      FROM review 
      WHERE id_wisata = ? AND status = 'approved'
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [id_wisata, limit, offset]);
    
    // Get total count
    const totalResult = await query(`
      SELECT COUNT(*) as total
      FROM review 
      WHERE id_wisata = ? AND status = 'approved'
    `, [id_wisata]);
    
    const total = totalResult[0].total;
    
    res.json({
      data: reviews,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}

async function getAllReviews(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const offset = (page - 1) * limit;
    
    let whereClause = '1=1';
    let params = [];
    
    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }
    
    // Get reviews with wisata info
    const reviews = await query(`
      SELECT r.id_review, r.nama_reviewer, r.email_reviewer, r.rating, r.komentar, 
             r.status, r.created_at, w.nama_wisata
      FROM review r
      JOIN wisata w ON r.id_wisata = w.id_wisata
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    
    // Get total count
    const totalResult = await query(`
      SELECT COUNT(*) as total
      FROM review r
      WHERE ${whereClause}
    `, params);
    
    const total = totalResult[0].total;
    
    res.json({
      data: reviews,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}

async function updateReviewStatus(req, res) {
  try {
    const { id_review } = req.params;
    const { status } = req.body;
    
    // Validasi status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    
    // Get review info
    const review = await query('SELECT id_wisata FROM review WHERE id_review = ?', [id_review]);
    if (!review || review.length === 0) {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }
    
    // Update status
    await query('UPDATE review SET status = ? WHERE id_review = ?', [status, id_review]);
    
    // Update wisata rating jika status berubah ke approved
    if (status === 'approved') {
      await updateWisataRating(review[0].id_wisata);
    }
    
    res.json({
      message: `Review berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`
    });
    
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}

async function getPendingReviews(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get pending reviews
    const reviews = await query(`
      SELECT r.id_review, r.nama_reviewer, r.email_reviewer, r.rating, r.komentar, 
             r.created_at, w.nama_wisata
      FROM review r
      JOIN wisata w ON r.id_wisata = w.id_wisata
      WHERE r.status = 'pending'
      ORDER BY r.created_at ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    // Get total count
    const totalResult = await query(`
      SELECT COUNT(*) as total
      FROM review 
      WHERE status = 'pending'
    `);
    
    const total = totalResult[0].total;
    
    res.json({
      data: reviews,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting pending reviews:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}

// Attraction Controllers
async function getAllAttractions(req, res) {
  try {
    const rows = await query(
      `SELECT
         w.id_wisata,
         w.id_kategori,
         k.nama_kategori,
         w.nama_wisata,
         w.deskripsi,
         w.harga_tiket,
         w.jam_operasional,
         w.fasilitas,
         w.peta_wisata,
         w.keterangan,
         w.average_rating,
         w.total_reviews,
         (SELECT gg.gambar FROM galeri gg WHERE gg.id_wisata = w.id_wisata ORDER BY gg.id_galeri ASC LIMIT 1) AS cover_image_url
       FROM wisata w
       LEFT JOIN kategori k ON k.id_kategori = w.id_kategori
       ORDER BY w.id_wisata DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllAttractions error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getAttractionById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT
         w.id_wisata,
         w.id_kategori,
         k.nama_kategori,
         w.nama_wisata,
         w.deskripsi,
         w.harga_tiket,
         w.jam_operasional,
         w.fasilitas,
         w.peta_wisata,
         w.keterangan,
         w.average_rating,
         w.total_reviews,
         (SELECT gg.gambar FROM galeri gg WHERE gg.id_wisata = w.id_wisata ORDER BY gg.id_galeri ASC LIMIT 1) AS cover_image_url
       FROM wisata w
       LEFT JOIN kategori k ON k.id_kategori = w.id_kategori
       WHERE w.id_wisata = ?
       LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getAttractionById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createAttraction(req, res) {
  try {
    const {
      category_id,
      name,
      description,
      ticket_price,
      operational_hours,
      facilities,
      gmaps_iframe_url,
      keterangan,
    } = req.body || {};

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const result = await query(
      `INSERT INTO wisata
        (id_kategori, nama_wisata, deskripsi, harga_tiket, jam_operasional, fasilitas, peta_wisata, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id || null,
        name,
        description || null,
        ticket_price || null,
        operational_hours || null,
        facilities || null,
        gmaps_iframe_url || null,
        keterangan || null,
      ]
    );

    const newId = result.insertId;
    res.status(201).json({ id_wisata: newId });
  } catch (err) {
    console.error('createAttraction error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateAttraction(req, res) {
  try {
    const { id } = req.params;
    const map = {
      category_id: 'id_kategori',
      name: 'nama_wisata',
      description: 'deskripsi',
      ticket_price: 'harga_tiket',
      operational_hours: 'jam_operasional',
      facilities: 'fasilitas',
      gmaps_iframe_url: 'peta_wisata',
      keterangan: 'keterangan',
    };

    const updates = [];
    const params = [];
    for (const [apiField, column] of Object.entries(map)) {
      if (Object.prototype.hasOwnProperty.call(req.body, apiField)) {
        updates.push(`${column} = ?`);
        params.push(req.body[apiField]);
      }
    }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE wisata SET ${updates.join(', ')} WHERE id_wisata = ?`, params);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'cover_image_url')) {
      const cover = req.body.cover_image_url;
      if (cover) {
        const existing = await query(
          `SELECT id_galeri FROM galeri WHERE id_wisata = ? ORDER BY id_galeri ASC LIMIT 1`,
          [id]
        );
        if (existing && existing.length > 0) {
          await query(`UPDATE galeri SET gambar = ?, keterangan = ?, nama = ? WHERE id_galeri = ?`, [
            cover,
            'Cover',
            'Cover',
            existing[0].id_galeri,
          ]);
        } else {
          await query(`INSERT INTO galeri (id_wisata, gambar, keterangan, nama) VALUES (?, ?, ?, ?)`, [
            id,
            cover,
            'Cover',
            'Cover',
          ]);
        }
      }
    }

    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('updateAttraction error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteAttraction(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM wisata WHERE id_wisata = ?', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteAttraction error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Event Controllers
async function getAllEvents(req, res) {
  try {
    const rows = await query(
      `SELECT 
         id_event,
         nama_event,
         deskripsi_event,
         tempat,
         tanggal_mulai,
         gambar_event
       FROM \`event\`
       ORDER BY tanggal_mulai DESC, id_event DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllEvents error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT 
         id_event,
         nama_event,
         deskripsi_event,
         tempat,
         tanggal_mulai,
         tanggal_selesai,
         gambar_event
       FROM \`event\`
       WHERE id_event = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('getEventById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createEvent(req, res) {
  try {
    const { name, description, event_date, end_date, location, image_url } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const result = await query(
      `INSERT INTO \`event\` (nama_event, deskripsi_event, tempat, tanggal_mulai, tanggal_selesai, gambar_event)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, location || null, event_date || null, end_date || null, image_url || null]
    );
    res.status(201).json({ id_event: result.insertId });
  } catch (err) {
    console.error('createEvent error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const map = {
      name: 'nama_event',
      description: 'deskripsi_event',
      location: 'tempat',
      event_date: 'tanggal_mulai',
      end_date: 'tanggal_selesai',
      image_url: 'gambar_event',
    };
    const updates = [];
    const params = [];
    for (const [apiField, column] of Object.entries(map)) {
      if (Object.prototype.hasOwnProperty.call(req.body, apiField)) {
        updates.push(`${column} = ?`);
        params.push(req.body[apiField]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    params.push(id);
    await query(`UPDATE \`event\` SET ${updates.join(', ')} WHERE id_event = ?`, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('updateEvent error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM `event` WHERE id_event = ?', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteEvent error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Gallery Controllers
async function getAllGalleries(req, res) {
  try {
    const rows = await query(
      `SELECT 
         g.id_galeri,
         g.id_wisata,
         g.gambar,
         g.keterangan,
         g.nama,
         w.nama_wisata
       FROM galeri g
       LEFT JOIN wisata w ON g.id_wisata = w.id_wisata
       ORDER BY g.id_galeri DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllGalleries error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getGalleryById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT 
         g.id_galeri,
         g.id_wisata,
         g.gambar,
         g.keterangan,
         g.nama
       FROM galeri g
       WHERE g.id_galeri = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('getGalleryById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createGallery(req, res) {
  try {
    const { id_wisata, gambar, keterangan, nama } = req.body || {};
    if (!id_wisata) return res.status(400).json({ message: 'id_wisata is required' });
    if (!gambar) return res.status(400).json({ message: 'gambar is required' });
    const result = await query(
      `INSERT INTO galeri (id_wisata, gambar, keterangan, nama) VALUES (?, ?, ?, ?)`,
      [id_wisata, gambar, keterangan || null, nama || null]
    );
    res.status(201).json({ id_galeri: result.insertId });
  } catch (err) {
    console.error('createGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateGallery(req, res) {
  try {
    const { id } = req.params;
    const { id_wisata, gambar, keterangan, nama } = req.body;
    
    // If updating image, get the old image path to delete it later
    let oldImagePath = null;
    if (gambar !== undefined) {
      const oldData = await query('SELECT gambar FROM galeri WHERE id_galeri = ?', [id]);
      if (oldData.length > 0) {
        oldImagePath = oldData[0].gambar;
      }
    }
    
    const updates = [];
    const params = [];
    
    if (id_wisata !== undefined) {
      updates.push('id_wisata = ?');
      params.push(id_wisata);
    }
    if (gambar !== undefined) {
      updates.push('gambar = ?');
      params.push(gambar);
    }
    if (keterangan !== undefined) {
      updates.push('keterangan = ?');
      params.push(keterangan);
    }
    if (nama !== undefined) {
      updates.push('nama = ?');
      params.push(nama);
    }
    
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    params.push(id);
    await query(`UPDATE galeri SET ${updates.join(', ')} WHERE id_galeri = ?`, params);
    
    // Delete old image file if it was updated and it's a local file
    if (oldImagePath && gambar !== undefined && oldImagePath !== gambar && oldImagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '../uploads', path.basename(oldImagePath));
      
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted old file: ${fullPath}`);
        } catch (fileErr) {
          console.error('Error deleting old file:', fileErr);
          // Don't fail the request if file deletion fails
        }
      }
    }
    
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('updateGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteGallery(req, res) {
  try {
    const { id } = req.params;
    
    // First, get the gallery data to know which file to delete
    const galleryData = await query('SELECT gambar FROM galeri WHERE id_galeri = ?', [id]);
    
    if (galleryData.length === 0) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    
    const imagePath = galleryData[0].gambar;
    
    // Delete from database first
    await query('DELETE FROM galeri WHERE id_galeri = ?', [id]);
    
    // If the image path is a local file (starts with /uploads/), delete the physical file
    if (imagePath && imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '../uploads', path.basename(imagePath));
      
      // Check if file exists and delete it
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted file: ${fullPath}`);
        } catch (fileErr) {
          console.error('Error deleting file:', fileErr);
          // Don't fail the request if file deletion fails
        }
      }
    }
    
    res.json({ message: 'Gallery and associated file deleted successfully' });
  } catch (err) {
    console.error('deleteGallery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Category Controllers
async function getAllCategories(req, res) {
  try {
    const rows = await query(
      `SELECT
         id_kategori,
         nama_kategori,
         deskripsi
       FROM kategori
       ORDER BY nama_kategori ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllCategories error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT
         id_kategori,
         nama_kategori,
         deskripsi
       FROM kategori
       WHERE id_kategori = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('getCategoryById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }
    
    const result = await query(
      `INSERT INTO kategori (nama_kategori, deskripsi)
       VALUES (?, ?)`,
      [name, description || null]
    );
    
    res.status(201).json({
      id_kategori: result.insertId,
      nama_kategori: name,
      deskripsi: description,
      message: 'Kategori berhasil ditambahkan'
    });
  } catch (err) {
    console.error('createCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }
    
    const result = await query(
      `UPDATE kategori 
       SET nama_kategori = ?, deskripsi = ?
       WHERE id_kategori = ?`,
      [name, description || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    res.json({
      id_kategori: id,
      nama_kategori: name,
      deskripsi: description,
      message: 'Kategori berhasil diperbarui'
    });
  } catch (err) {
    console.error('updateCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    
    // Check if category is being used by attractions
    const attractions = await query(
      `SELECT COUNT(*) as count FROM wisata WHERE id_kategori = ?`,
      [id]
    );
    
    if (attractions[0].count > 0) {
      return res.status(400).json({ 
        message: 'Kategori tidak dapat dihapus karena masih digunakan oleh objek wisata' 
      });
    }
    
    const result = await query(
      `DELETE FROM kategori WHERE id_kategori = ?`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error('deleteCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Admin Controllers
async function login(req, res) {
  try {
    const { password } = req.body || {};
    const username = (req.body && (req.body.username || req.body.email)) || '';

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admins = await query(
      'SELECT id_admin AS id, username, password FROM admin WHERE username = ? LIMIT 1',
      [username]
    );
    if (!admins || admins.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const admin = admins[0];
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const token = jwt.sign({ id: admin.id, username: admin.username }, secret, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Upload Controller
async function handleImageUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({ 
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
}

// ===== ROUTES =====

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Public API routes
router.get('/attractions', getAllAttractions);
router.get('/attractions/:id', getAttractionById);

router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);

router.get('/gallery', getAllGalleries);
router.get('/gallery/:id', getGalleryById);

router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);

// Review routes (public)
router.post('/reviews', createReview);
router.get('/reviews/wisata/:id_wisata', getReviewsByWisata);

// Admin login (public)
router.post('/admin/login', login);

// Protected admin routes - create a separate router for admin
const adminRouter = express.Router();
adminRouter.use(requireAuth);

// Admin attractions
adminRouter.get('/attractions', getAllAttractions);
adminRouter.get('/attractions/:id', getAttractionById);
adminRouter.post('/attractions', createAttraction);
adminRouter.put('/attractions/:id', updateAttraction);
adminRouter.delete('/attractions/:id', deleteAttraction);

// Admin events
adminRouter.get('/events', getAllEvents);
adminRouter.get('/events/:id', getEventById);
adminRouter.post('/events', createEvent);
adminRouter.put('/events/:id', updateEvent);
adminRouter.delete('/events/:id', deleteEvent);

// Admin categories
adminRouter.get('/categories', getAllCategories);
adminRouter.get('/categories/:id', getCategoryById);
adminRouter.post('/categories', createCategory);
adminRouter.put('/categories/:id', updateCategory);
adminRouter.delete('/categories/:id', deleteCategory);

// Admin galleries
adminRouter.get('/galleries', getAllGalleries);
adminRouter.get('/galleries/:id', getGalleryById);
adminRouter.post('/galleries', createGallery);
adminRouter.put('/galleries/:id', updateGallery);
adminRouter.delete('/galleries/:id', deleteGallery);

// Admin reviews
adminRouter.get('/reviews', getAllReviews);
adminRouter.get('/reviews/pending', getPendingReviews);
adminRouter.put('/reviews/:id_review/status', updateReviewStatus);

// Admin upload
adminRouter.post('/upload-image', upload.single('image'), handleImageUpload);

// Mount admin router
router.use('/admin', adminRouter);

// ===== ERROR HANDLING =====

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
router.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB'
    });
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Use router
app.use(router);

// ===== DATABASE INITIALIZATION =====

// Database connection test
async function ensureDatabaseConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Database connection established');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    // Create admin table
    await query(`
      CREATE TABLE IF NOT EXISTS admin (
        id_admin INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create kategori table
    await query(`
      CREATE TABLE IF NOT EXISTS kategori (
        id_kategori INT AUTO_INCREMENT PRIMARY KEY,
        nama_kategori VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create wisata table
    await query(`
      CREATE TABLE IF NOT EXISTS wisata (
        id_wisata INT AUTO_INCREMENT PRIMARY KEY,
        id_kategori INT,
        nama_wisata VARCHAR(200) NOT NULL,
        deskripsi TEXT,
        harga_tiket DECIMAL(10,2),
        jam_operasional VARCHAR(100),
        fasilitas TEXT,
        peta_wisata TEXT,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori) ON DELETE SET NULL
      )
    `);

    // Create event table
    await query(`
      CREATE TABLE IF NOT EXISTS \`event\` (
        id_event INT AUTO_INCREMENT PRIMARY KEY,
        nama_event VARCHAR(200) NOT NULL,
        deskripsi_event TEXT,
        tempat VARCHAR(255),
        tanggal_mulai DATE,
        tanggal_selesai DATE,
        gambar_event VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create galeri table
    await query(`
      CREATE TABLE IF NOT EXISTS galeri (
        id_galeri INT AUTO_INCREMENT PRIMARY KEY,
        id_wisata INT,
        gambar VARCHAR(500) NOT NULL,
        keterangan TEXT,
        nama VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_wisata) REFERENCES wisata(id_wisata) ON DELETE CASCADE
      )
    `);

    // Add rating columns to wisata table
    await query(`
      ALTER TABLE wisata 
      ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0
    `);

    // Create review table
    await query(`
      CREATE TABLE IF NOT EXISTS review (
        id_review INT AUTO_INCREMENT PRIMARY KEY,
        id_wisata INT NOT NULL,
        nama_reviewer VARCHAR(150) NOT NULL,
        email_reviewer VARCHAR(255),
        rating DECIMAL(2,1) NOT NULL,
        komentar TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_wisata) REFERENCES wisata(id_wisata) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

// Seed default admin user
async function seedDefaultAdminIfEnabled() {
  try {
    const { 
      SEED_ADMIN_ON_STARTUP = 'true', 
      ADMIN_USERNAME = 'admin', 
      ADMIN_PASSWORD = 'admin123' 
    } = process.env;
    
    if (SEED_ADMIN_ON_STARTUP !== 'true') {
      console.log('ℹ️  Admin seeding disabled');
      return;
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const existing = await query('SELECT id_admin FROM admin WHERE username = ? LIMIT 1', [ADMIN_USERNAME]);
    
    if (!existing || existing.length === 0) {
      await query('INSERT INTO admin (username, password) VALUES (?, ?)', [ADMIN_USERNAME, hashed]);
      console.log(`✅ Seeded admin user: ${ADMIN_USERNAME}`);
    } else {
      const adminId = existing[0].id_admin;
      await query('UPDATE admin SET password = ? WHERE id_admin = ?', [hashed, adminId]);
      console.log(`✅ Updated admin password for: ${ADMIN_USERNAME}`);
    }
  } catch (error) {
    console.error('❌ Admin seeding failed:', error.message);
  }
}

// ===== SERVER STARTUP =====

// Startup function
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await ensureDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Seed admin user
    await seedDefaultAdminIfEnabled();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📁 Static files: http://localhost:${PORT}/uploads`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 Default admin: admin / admin123`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();


