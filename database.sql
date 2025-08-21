-- database.sql

CREATE DATABASE IF NOT EXISTS isad8273_bulukumba_tourism;
USE isad8273_bulukumba_tourism;

-- Tabel Admin (login admin)
CREATE TABLE IF NOT EXISTS admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Kategori (master kategori wisata dan hotel)
CREATE TABLE IF NOT EXISTS kategori (
    id_kategori INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(150) NOT NULL,
    gambar VARCHAR(255),
    deskripsi TEXT,
    UNIQUE KEY uq_kategori_nama (nama_kategori)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Jelajah Wisata (detail destinasi)
-- Menyimpan informasi lengkap objek wisata termasuk rating dan jumlah review
-- average_rating: rata-rata rating dari review yang approved (0.00 - 5.00)
-- total_reviews: jumlah total review yang approved
CREATE TABLE IF NOT EXISTS wisata (
    id_wisata INT AUTO_INCREMENT PRIMARY KEY,
    id_kategori INT NOT NULL,
    nama_wisata VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga_tiket VARCHAR(100),
    jam_operasional VARCHAR(100),
    fasilitas TEXT,
    peta_wisata TEXT,
    keterangan TEXT,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    KEY idx_wisata_id_kategori (id_kategori),
    CONSTRAINT fk_wisata_kategori FOREIGN KEY (id_kategori)
        REFERENCES kategori(id_kategori)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Hotel (detail hotel)
-- Menyimpan informasi lengkap hotel termasuk rating dan jumlah review
-- average_rating: rata-rata rating dari review yang approved (0.00 - 5.00)
-- total_reviews: jumlah total review yang approved
CREATE TABLE IF NOT EXISTS hotel (
    id_hotel INT AUTO_INCREMENT PRIMARY KEY,
    id_kategori INT NOT NULL,
    nama_hotel VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga_kamar VARCHAR(100),
    alamat_hotel TEXT,
    nomor_telepon VARCHAR(50),
    website VARCHAR(255),
    fasilitas TEXT,
    peta_hotel TEXT,
    keterangan TEXT,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    KEY idx_hotel_id_kategori (id_kategori),
    CONSTRAINT fk_hotel_kategori FOREIGN KEY (id_kategori)
        REFERENCES kategori(id_kategori)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Restoran (detail restoran)
-- Menyimpan informasi lengkap restoran termasuk rating dan jumlah review
-- average_rating: rata-rata rating dari review yang approved (0.00 - 5.00)
-- total_reviews: jumlah total review yang approved
CREATE TABLE IF NOT EXISTS restoran (
    id_restoran INT AUTO_INCREMENT PRIMARY KEY,
    id_kategori INT NOT NULL,
    nama_restoran VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga_rata_rata VARCHAR(100),
    jam_operasional VARCHAR(100),
    alamat_restoran TEXT,
    nomor_telepon VARCHAR(50),
    website VARCHAR(255),
    menu_unggulan TEXT,
    peta_restoran TEXT,
    keterangan TEXT,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    KEY idx_restoran_id_kategori (id_kategori),
    CONSTRAINT fk_restoran_kategori FOREIGN KEY (id_kategori)
        REFERENCES kategori(id_kategori)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Event (jadwal acara/festival)
CREATE TABLE IF NOT EXISTS `event` (
    id_event INT AUTO_INCREMENT PRIMARY KEY,
    nama_event VARCHAR(255) NOT NULL,
    deskripsi_event TEXT,
    tempat VARCHAR(255),
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    gambar_event VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Publikasi/Galeri (koleksi foto destinasi, hotel, dan restoran)
-- Dimodifikasi untuk mendukung galeri wisata, hotel, dan restoran
CREATE TABLE IF NOT EXISTS galeri (
    id_galeri INT AUTO_INCREMENT PRIMARY KEY,
    id_wisata INT DEFAULT NULL,
    id_hotel INT DEFAULT NULL,
    id_restoran INT DEFAULT NULL,
    gambar VARCHAR(255) NOT NULL,
    keterangan VARCHAR(255) DEFAULT NULL,
    nama VARCHAR(255) DEFAULT NULL,
    KEY idx_galeri_id_wisata (id_wisata),
    KEY idx_galeri_id_hotel (id_hotel),
    KEY idx_galeri_id_restoran (id_restoran),
    CONSTRAINT fk_galeri_wisata FOREIGN KEY (id_wisata)
        REFERENCES wisata(id_wisata)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_galeri_hotel FOREIGN KEY (id_hotel)
        REFERENCES hotel(id_hotel)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_galeri_restoran FOREIGN KEY (id_restoran)
        REFERENCES restoran(id_restoran)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    -- Memastikan hanya salah satu yang terisi (wisata, hotel, atau restoran)
    CONSTRAINT chk_galeri_reference CHECK (
        (id_wisata IS NOT NULL AND id_hotel IS NULL AND id_restoran IS NULL) OR 
        (id_wisata IS NULL AND id_hotel IS NOT NULL AND id_restoran IS NULL) OR
        (id_wisata IS NULL AND id_hotel IS NULL AND id_restoran IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Review (ulasan pengunjung untuk wisata, hotel, dan restoran)
-- Dimodifikasi untuk mendukung review wisata, hotel, dan restoran
-- Menyimpan ulasan dan rating dari pengunjung untuk setiap objek wisata/hotel/restoran
-- Sistem moderasi: pending (menunggu), approved (disetujui), rejected (ditolak)
-- Rating: 1.0 - 5.0 dengan increment 0.5
-- Auto-approval: rating 3-5 tanpa kata spam
-- Manual review: rating 1-2 atau mengandung kata spam
CREATE TABLE IF NOT EXISTS review (
    id_review INT AUTO_INCREMENT PRIMARY KEY,
    id_wisata INT DEFAULT NULL,
    id_hotel INT DEFAULT NULL,
    id_restoran INT DEFAULT NULL,
    nama_reviewer VARCHAR(150) NOT NULL,
    email_reviewer VARCHAR(255) DEFAULT NULL,
    rating DECIMAL(2,1) NOT NULL,
    komentar TEXT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_review_id_wisata (id_wisata),
    KEY idx_review_id_hotel (id_hotel),
    KEY idx_review_id_restoran (id_restoran),
    KEY idx_review_status (status),
    KEY idx_review_created_at (created_at),
    CONSTRAINT fk_review_wisata FOREIGN KEY (id_wisata)
        REFERENCES wisata(id_wisata)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_review_hotel FOREIGN KEY (id_hotel)
        REFERENCES hotel(id_hotel)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_review_restoran FOREIGN KEY (id_restoran)
        REFERENCES restoran(id_restoran)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    -- Memastikan hanya salah satu yang terisi (wisata, hotel, atau restoran)
    CONSTRAINT chk_review_reference CHECK (
        (id_wisata IS NOT NULL AND id_hotel IS NULL AND id_restoran IS NULL) OR 
        (id_wisata IS NULL AND id_hotel IS NOT NULL AND id_restoran IS NULL) OR
        (id_wisata IS NULL AND id_hotel IS NULL AND id_restoran IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === DATA AWAL ===

-- Akun admin default
-- Passwordnya adalah 'admin123' (hash bcrypt harus diganti sesuai implementasi)
INSERT IGNORE INTO admin (username, password) VALUES (
  'admin',
  '$2b$10$abcdefghijklmnopqrstuv'
);

-- === MIGRATION SCRIPTS ===
-- Script untuk update database yang sudah ada agar sesuai dengan schema terbaru

-- Migration untuk memperbaiki tabel galeri jika kolom id_hotel dan id_restoran belum ada
-- Pertama, pastikan semua kolom reference boleh NULL
ALTER TABLE galeri MODIFY COLUMN id_wisata INT DEFAULT NULL;

-- Tambahkan kolom id_hotel jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'galeri' 
     AND COLUMN_NAME = 'id_hotel') = 0,
    'ALTER TABLE galeri ADD COLUMN id_hotel INT DEFAULT NULL AFTER id_wisata',
    'ALTER TABLE galeri MODIFY COLUMN id_hotel INT DEFAULT NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan kolom id_restoran jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'galeri' 
     AND COLUMN_NAME = 'id_restoran') = 0,
    'ALTER TABLE galeri ADD COLUMN id_restoran INT DEFAULT NULL AFTER id_hotel',
    'ALTER TABLE galeri MODIFY COLUMN id_restoran INT DEFAULT NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Pastikan kolom keterangan dan nama juga boleh NULL
ALTER TABLE galeri MODIFY COLUMN keterangan VARCHAR(255) DEFAULT NULL;
ALTER TABLE galeri MODIFY COLUMN nama VARCHAR(255) DEFAULT NULL;

-- === MIGRATION UNTUK TABEL REVIEW ===
-- Tambahkan kolom id_hotel di tabel review jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'review' 
     AND COLUMN_NAME = 'id_hotel') = 0,
    'ALTER TABLE review ADD COLUMN id_hotel INT DEFAULT NULL AFTER id_wisata',
    'ALTER TABLE review MODIFY COLUMN id_hotel INT DEFAULT NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan kolom id_restoran di tabel review jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'review' 
     AND COLUMN_NAME = 'id_restoran') = 0,
    'ALTER TABLE review ADD COLUMN id_restoran INT DEFAULT NULL AFTER id_hotel',
    'ALTER TABLE review MODIFY COLUMN id_restoran INT DEFAULT NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan foreign key untuk id_hotel di tabel review jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'review' 
     AND CONSTRAINT_NAME = 'fk_review_hotel') = 0,
    'ALTER TABLE review ADD CONSTRAINT fk_review_hotel FOREIGN KEY (id_hotel) REFERENCES hotel(id_hotel) ON UPDATE CASCADE ON DELETE CASCADE',
    'SELECT "Foreign key fk_review_hotel already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan foreign key untuk id_restoran di tabel review jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'review' 
     AND CONSTRAINT_NAME = 'fk_review_restoran') = 0,
    'ALTER TABLE review ADD CONSTRAINT fk_review_restoran FOREIGN KEY (id_restoran) REFERENCES restoran(id_restoran) ON UPDATE CASCADE ON DELETE CASCADE',
    'SELECT "Foreign key fk_review_restoran already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan index untuk id_hotel di tabel review jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'review' 
     AND INDEX_NAME = 'idx_review_id_hotel') = 0,
    'ALTER TABLE review ADD KEY idx_review_id_hotel (id_hotel)',
    'SELECT "Index idx_review_id_hotel already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan index untuk id_restoran di tabel review jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'review' 
     AND INDEX_NAME = 'idx_review_id_restoran') = 0,
    'ALTER TABLE review ADD KEY idx_review_id_restoran (id_restoran)',
    'SELECT "Index idx_review_id_restoran already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Pastikan kolom reference di tabel review boleh NULL
ALTER TABLE review MODIFY COLUMN id_wisata INT DEFAULT NULL;
ALTER TABLE review MODIFY COLUMN email_reviewer VARCHAR(255) DEFAULT NULL;
ALTER TABLE review MODIFY COLUMN komentar TEXT DEFAULT NULL;

-- Tambahkan foreign key untuk id_hotel jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'galeri' 
     AND CONSTRAINT_NAME = 'fk_galeri_hotel') = 0,
    'ALTER TABLE galeri ADD CONSTRAINT fk_galeri_hotel FOREIGN KEY (id_hotel) REFERENCES hotel(id_hotel) ON UPDATE CASCADE ON DELETE CASCADE',
    'SELECT "Foreign key fk_galeri_hotel already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan foreign key untuk id_restoran jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'galeri' 
     AND CONSTRAINT_NAME = 'fk_galeri_restoran') = 0,
    'ALTER TABLE galeri ADD CONSTRAINT fk_galeri_restoran FOREIGN KEY (id_restoran) REFERENCES restoran(id_restoran) ON UPDATE CASCADE ON DELETE CASCADE',
    'SELECT "Foreign key fk_galeri_restoran already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan index untuk id_hotel jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'galeri' 
     AND INDEX_NAME = 'idx_galeri_id_hotel') = 0,
    'ALTER TABLE galeri ADD KEY idx_galeri_id_hotel (id_hotel)',
    'SELECT "Index idx_galeri_id_hotel already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan index untuk id_restoran jika belum ada
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'galeri' 
     AND INDEX_NAME = 'idx_galeri_id_restoran') = 0,
    'ALTER TABLE galeri ADD KEY idx_galeri_id_restoran (id_restoran)',
    'SELECT "Index idx_galeri_id_restoran already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambahkan check constraint jika didukung oleh versi MySQL
-- Note: Check constraint hanya didukung di MySQL 8.0+
-- Jika error, abaikan saja karena constraint ini opsional
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'galeri' 
     AND CONSTRAINT_NAME = 'chk_galeri_reference') = 0 
     AND @@version >= '8.0',
    'ALTER TABLE galeri ADD CONSTRAINT chk_galeri_reference CHECK ((id_wisata IS NOT NULL AND id_hotel IS NULL AND id_restoran IS NULL) OR (id_wisata IS NULL AND id_hotel IS NOT NULL AND id_restoran IS NULL) OR (id_wisata IS NULL AND id_hotel IS NULL AND id_restoran IS NOT NULL))',
    'SELECT "Check constraint not needed or already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tampilkan pesan sukses
SELECT 'Database migration completed successfully!' as message;