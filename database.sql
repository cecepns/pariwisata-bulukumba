-- database.sql

CREATE DATABASE IF NOT EXISTS bulukumba_tourism_db;
USE bulukumba_tourism_db;

-- Tabel Admin (login admin)
CREATE TABLE IF NOT EXISTS admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Kategori (master kategori wisata)
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

-- Tabel Publikasi/Galeri (koleksi foto destinasi)
CREATE TABLE IF NOT EXISTS galeri (
    id_galeri INT AUTO_INCREMENT PRIMARY KEY,
    id_wisata INT NOT NULL,
    gambar VARCHAR(255) NOT NULL,
    keterangan VARCHAR(255),
    nama VARCHAR(255),
    KEY idx_galeri_id_wisata (id_wisata),
    CONSTRAINT fk_galeri_wisata FOREIGN KEY (id_wisata)
        REFERENCES wisata(id_wisata)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Review (ulasan pengunjung)
-- Menyimpan ulasan dan rating dari pengunjung untuk setiap objek wisata
-- Sistem moderasi: pending (menunggu), approved (disetujui), rejected (ditolak)
-- Rating: 1.0 - 5.0 dengan increment 0.5
-- Auto-approval: rating 3-5 tanpa kata spam
-- Manual review: rating 1-2 atau mengandung kata spam
CREATE TABLE IF NOT EXISTS review (
    id_review INT AUTO_INCREMENT PRIMARY KEY,
    id_wisata INT NOT NULL,
    nama_reviewer VARCHAR(150) NOT NULL,
    email_reviewer VARCHAR(255),
    rating DECIMAL(2,1) NOT NULL,
    komentar TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_review_id_wisata (id_wisata),
    KEY idx_review_status (status),
    KEY idx_review_created_at (created_at),
    CONSTRAINT fk_review_wisata FOREIGN KEY (id_wisata)
        REFERENCES wisata(id_wisata)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === DATA AWAL ===

-- Akun admin default
-- Passwordnya adalah 'admin123' (hash bcrypt harus diganti sesuai implementasi)
INSERT IGNORE INTO admin (username, password) VALUES (
  'admin',
  '$2b$10$abcdefghijklmnopqrstuv'
);



