# Changelog

All notable changes to the Bulukumba Tourism Components will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- **Button Component**: Komponen tombol dengan berbagai variant dan ukuran
  - Support untuk 10 variant: primary, secondary, success, error, warning, info, ghost, outline, soft, link
  - Support untuk 5 ukuran: xs, sm, md, lg, xl
  - Loading state dan disabled state
  - Focus ring dan hover effects

- **Input Component**: Komponen input dengan validasi dan state
  - Support untuk berbagai tipe input
  - Error state dan helper text
  - Left dan right icon support
  - Required field indicator

- **Textarea Component**: Komponen textarea untuk input teks panjang
  - Configurable rows
  - Error state dan helper text
  - Consistent styling dengan Input component

- **Select Component**: Komponen dropdown untuk pilihan
  - Options array support
  - Placeholder text
  - Error state dan helper text
  - Disabled state

- **Card Component**: Komponen card untuk menampung konten
  - Header, Body, dan Footer sections
  - Configurable padding, shadow, dan border
  - Hover effects
  - Responsive design

- **Badge Component**: Komponen badge untuk status dan label
  - 8 variant: primary, secondary, success, error, warning, info, ghost, outline
  - 4 ukuran: xs, sm, md, lg
  - Consistent styling

- **Loading Component**: Komponen loading dengan berbagai animasi
  - 6 variant: spinner, dots, ring, ball, bars, infinity
  - 4 ukuran: xs, sm, md, lg
  - Optional text support

- **DataTable Component**: Komponen tabel data yang dapat dikustomisasi
  - Column configuration
  - Loading state
  - Empty state
  - Action buttons (Edit, Delete, View)
  - Badge dan date rendering
  - Custom cell rendering

- **Form Component**: Komponen form dengan struktur dan validasi
  - Section dan Row layout
  - Built-in submit button
  - Loading state
  - Consistent field spacing

- **Modal Component**: Komponen modal untuk dialog dan konfirmasi
  - 5 ukuran: sm, md, lg, xl, full
  - Confirm modal variant
  - Keyboard support (Escape key)
  - Overlay click to close
  - Focus management

- **Alert Component**: Komponen alert untuk menampilkan pesan
  - 4 tipe: info, success, warning, error
  - Optional close button
  - Icon support
  - Consistent styling

### Features
- Atomic Design Architecture
- Tailwind CSS + DaisyUI integration
- TypeScript support
- Responsive design
- Accessibility features
- Consistent theming
- Comprehensive documentation
- Example usage components

### Technical Details
- Built with React 18
- Styled with Tailwind CSS and DaisyUI
- TypeScript definitions included
- Modular component structure
- Reusable and composable design
- Performance optimized
- SEO friendly

### Documentation
- Complete README with usage examples
- TypeScript definitions
- Component examples page
- Best practices guide
- Customization guide
