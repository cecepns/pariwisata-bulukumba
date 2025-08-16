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


router.post('/admin/login', login);

router.get('/attractions', getAllAttractions);
router.get('/attractions/:id', getAttractionById);

router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);

router.get('/galleries', getAllGalleries);
router.get('/galleries/:id', getGalleryById);

router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);

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

module.exports = router;