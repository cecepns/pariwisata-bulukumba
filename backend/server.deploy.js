const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const pool = mysql.createPool({
  host: "localhost",
  user: "isad8273_bulukumba_tourism",
  password: "isad8273_bulukumba_tourism",
  database: "isad8273_bulukumba_tourism",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

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

// ===== REVIEW CONTROLLERS =====

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

const fs = require('fs');
const path = require('path');

// In CommonJS, __filename and __dirname are already available globally
// No need to use import.meta.url or fileURLToPath

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

// Admin login function
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

// Category functions
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

// Upload configuration and functions
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

const uploadImage = upload.single('image');

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


// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.post('/admin/login', login);

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

router.use('/uploads', express.static(path.join(__dirname, 'uploads-bulukumba-wisata')));


// Protected content management
router.use(requireAuth);

// Attractions
router.get('/admin/attractions', getAllAttractions);
router.get('/admin/attractions/:id', getAttractionById);
router.post('/admin/attractions', createAttraction);
router.put('/admin/attractions/:id', updateAttraction);
router.delete('/admin/attractions/:id', deleteAttraction);

// Events
router.get('/admin/events', getAllEvents);
router.get('/admin/events/:id', getEventById);
router.post('/admin/events', createEvent);
router.put('/admin/events/:id', updateEvent);
router.delete('/admin/events/:id', deleteEvent);

// Categories
router.get('/admin/categories', getAllCategories);
router.get('/admin/categories/:id', getCategoryById);
router.post('/admin/categories', createCategory);
router.put('/admin/categories/:id', updateCategory);
router.delete('/admin/categories/:id', deleteCategory);

// Upload
router.post('/admin/upload-image', uploadImage, handleImageUpload);

// Galleries
router.get('/admin/galleries', getAllGalleries);
router.get('/admin/galleries/:id', getGalleryById);
router.post('/admin/galleries', createGallery);
router.put('/admin/galleries/:id', updateGallery);
router.delete('/admin/galleries/:id', deleteGallery);

// Admin reviews
router.get('/admin/reviews', getAllReviews);
router.get('/admin/reviews/pending', getPendingReviews);
router.put('/admin/reviews/:id_review/status', updateReviewStatus);

module.exports = router;