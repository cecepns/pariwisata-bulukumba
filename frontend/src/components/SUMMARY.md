# Komponen Atomik & Molekul - Summary

## Overview
Sistem komponen atomik dan molekul untuk aplikasi Bulukumba Tourism yang dibangun dengan React, Tailwind CSS, dan DaisyUI.

## Struktur Komponen

### 🧩 Atoms (Komponen Dasar)
Komponen-komponen yang tidak dapat dipecah lagi menjadi komponen yang lebih kecil.

1. **Button** - Komponen tombol dengan berbagai variant dan ukuran
2. **Input** - Komponen input dengan validasi dan state
3. **Textarea** - Komponen textarea untuk input teks panjang
4. **Select** - Komponen dropdown untuk pilihan
5. **Card** - Komponen card untuk menampung konten
6. **Badge** - Komponen badge untuk status dan label
7. **Loading** - Komponen loading dengan berbagai animasi

### 🧬 Molecules (Komponen Gabungan)
Komponen yang terdiri dari beberapa atom yang bekerja bersama.

1. **DataTable** - Komponen tabel data yang dapat dikustomisasi
2. **Form** - Komponen form dengan struktur dan validasi
3. **Modal** - Komponen modal untuk dialog dan konfirmasi
4. **Alert** - Komponen alert untuk menampilkan pesan

## Fitur Utama

### ✅ Konsistensi
- Design system yang konsisten
- Spacing dan typography yang seragam
- Color palette yang terstandarisasi

### ✅ Reusability
- Komponen yang dapat digunakan kembali
- Props yang fleksibel
- Default values yang masuk akal

### ✅ Accessibility
- ARIA labels dan roles
- Keyboard navigation
- Screen reader support
- Focus management

### ✅ Responsive
- Mobile-first approach
- Breakpoint yang konsisten
- Flexible layouts

### ✅ Performance
- Optimized rendering
- Lazy loading support
- Minimal bundle size

## Teknologi

- **React 18** - UI Library
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library untuk Tailwind
- **TypeScript** - Type safety (optional)
- **Jest & Testing Library** - Testing framework
- **Storybook** - Component documentation

## Penggunaan

### Import Komponen
```jsx
import { Button, Input, DataTable, Modal } from '../components';
```

### Contoh Penggunaan
```jsx
// Button dengan variant
<Button variant="primary" size="lg" loading>
  Simpan Data
</Button>

// Form dengan validasi
<Form onSubmit={handleSubmit} loading={isSubmitting}>
  <Form.Input
    label="Nama"
    placeholder="Masukkan nama"
    required
    error={errors.name}
  />
</Form>

// DataTable dengan actions
<DataTable
  data={attractions}
  columns={columns}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Dokumentasi

- **README.md** - Dokumentasi lengkap komponen
- **ComponentExamples.jsx** - Contoh penggunaan semua komponen
- **types.ts** - TypeScript definitions
- **CHANGELOG.md** - Riwayat perubahan
- **.storybook/** - Konfigurasi Storybook

## Testing

- Unit tests untuk setiap komponen
- Integration tests untuk molecules
- Accessibility tests
- Visual regression tests (dengan Storybook)

## Development

### Scripts
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run Storybook
npm run storybook

# Build Storybook
npm run build-storybook

# Type checking
npm run type-check
```

### Struktur File
```
components/
├── atoms/              # Komponen dasar
├── molecules/          # Komponen gabungan
├── examples/           # Contoh penggunaan
├── .storybook/         # Konfigurasi Storybook
├── __mocks__/          # Mock files untuk testing
├── index.js            # File ekspor utama
├── types.ts            # TypeScript definitions
├── index.css           # Custom styles
├── README.md           # Dokumentasi
├── CHANGELOG.md        # Riwayat perubahan
└── package.json        # Package configuration
```

## Best Practices

1. **Konsistensi** - Gunakan komponen yang sama untuk fungsi yang sama
2. **Props** - Selalu berikan props yang diperlukan dan gunakan default values
3. **Accessibility** - Pastikan komponen mendukung accessibility
4. **Responsive** - Gunakan responsive classes untuk tampilan mobile
5. **Performance** - Gunakan React.memo untuk komponen yang sering re-render
6. **Testing** - Tulis test untuk komponen yang kompleks

## Customization

Semua komponen dapat dikustomisasi melalui:
- Props untuk mengubah behavior
- className untuk styling tambahan
- CSS variables untuk theming
- Tailwind classes untuk layout dan spacing

## Contributing

1. Ikuti atomic design principles
2. Tulis dokumentasi yang jelas
3. Tambahkan tests untuk komponen baru
4. Update CHANGELOG.md
5. Pastikan accessibility compliance

## License

MIT License - Lihat file LICENSE untuk detail lebih lanjut.
