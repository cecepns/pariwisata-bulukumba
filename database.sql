-- database.sql

CREATE DATABASE IF NOT EXISTS bulukumba_tourism_db;
USE bulukumba_tourism_db;

-- Tabel untuk admin
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Tabel untuk kategori wisata
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabel untuk objek wisata
CREATE TABLE IF NOT EXISTS attractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ticket_price VARCHAR(100),
    operational_hours VARCHAR(100),
    facilities TEXT,
    gmaps_iframe_url TEXT,
    cover_image_url VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabel untuk event
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    location VARCHAR(255),
    image_url VARCHAR(255)
);

-- Tabel untuk galeri
CREATE TABLE IF NOT EXISTS galleries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255)
);

-- === DATA AWAL ===

-- Buat akun admin default
-- Passwordnya adalah 'admin123' (Anda harus menghash-nya dengan bcrypt di backend)
INSERT INTO admins (email, password) VALUES (
  'admin@pariwisata.go.id',
  '$2b$10$abcdefghijklmnopqrstuv'
); -- Ganti dengan hash bcrypt yang sebenarnya saat implementasi atau jalankan seeder admin

-- Isi beberapa kategori awal
INSERT INTO categories (name) VALUES ('Wisata Alam'), ('Wisata Budaya'), ('Wisata Buatan');


