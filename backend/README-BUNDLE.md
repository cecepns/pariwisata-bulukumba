# Server Bundle Documentation

## Overview
Server files telah di-bundle menjadi satu file menggunakan Webpack untuk memudahkan deployment dan distribusi.

## File Bundle
- **Location**: `dist/server.js`
- **Size**: ~1.89KB (minified)
- **Dependencies**: Semua dependencies tetap di `node_modules/`
- **Format**: CommonJS (menggunakan `require` statements)

## Scripts Available

### Development
```bash
npm run dev          # Run development server with nodemon
npm start           # Run original server.js
```

### Production (Bundled)
```bash
npm run build       # Build server bundle
npm run start:bundle # Run bundled server
```

## Build Process

1. **Install dependencies** (jika belum):
   ```bash
   npm install
   ```

2. **Build bundle**:
   ```bash
   npm run build
   ```

3. **Run bundled server**:
   ```bash
   npm run start:bundle
   ```

## Bundle Configuration

- **Entry point**: `server.js`
- **Output**: `dist/server.js`
- **Mode**: Production (minified)
- **Target**: Node.js
- **Externals**: Dependencies tetap external untuk mengurangi ukuran bundle

## Deployment

Untuk deployment, Anda hanya perlu:
1. File `dist/server.js`
2. Folder `node_modules/`
3. File `.env` (environment variables)
4. Folder `uploads/` (jika ada file upload)

## Benefits

1. **Single file**: Semua kode server dalam satu file
2. **Minified**: Ukuran lebih kecil untuk production
3. **Easier deployment**: Hanya perlu satu file JavaScript
4. **Better caching**: Bundle hash untuk cache invalidation

## Notes

- Bundle menggunakan CommonJS dengan `require` statements
- Dependencies tetap external untuk kompatibilitas
- Upload folder tetap perlu di-copy secara terpisah
- Environment variables tetap perlu dikonfigurasi
