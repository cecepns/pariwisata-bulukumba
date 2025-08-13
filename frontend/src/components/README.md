# Komponen Atomik dan Molekul

Dokumentasi komponen-komponen yang dapat digunakan kembali dalam aplikasi Bulukumba Tourism.

## Struktur Komponen

```
components/
├── atoms/          # Komponen dasar yang tidak dapat dipecah lagi
├── molecules/      # Komponen yang terdiri dari beberapa atom
└── index.js        # File ekspor utama
```

## Komponen Atomik

### Button
Komponen tombol yang dapat dikustomisasi dengan berbagai variant dan ukuran.

```jsx
import { Button } from '../components';

// Penggunaan dasar
<Button>Klik Saya</Button>

// Dengan variant
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="error">Error</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Info</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="soft">Soft</Button>
<Button variant="link">Link</Button>

// Dengan ukuran
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// Dengan loading state
<Button loading>Loading...</Button>

// Dengan disabled state
<Button disabled>Tidak Aktif</Button>
```

### Input
Komponen input yang mendukung berbagai tipe dan state.

```jsx
import { Input } from '../components';

// Penggunaan dasar
<Input label="Nama" placeholder="Masukkan nama" />

// Dengan validasi
<Input 
  label="Email" 
  type="email" 
  error="Email tidak valid" 
  required 
/>

// Dengan icon
<Input 
  label="Cari" 
  leftIcon="🔍" 
  placeholder="Cari sesuatu..." 
/>

// Dengan helper text
<Input 
  label="Password" 
  type="password" 
  helperText="Minimal 8 karakter" 
/>
```

### Textarea
Komponen textarea untuk input teks panjang.

```jsx
import { Textarea } from '../components';

<Textarea 
  label="Deskripsi" 
  placeholder="Masukkan deskripsi..." 
  rows={4} 
/>
```

### Select
Komponen dropdown untuk pilihan.

```jsx
import { Select } from '../components';

const options = [
  { value: '1', label: 'Pilihan 1' },
  { value: '2', label: 'Pilihan 2' },
  { value: '3', label: 'Pilihan 3' }
];

<Select 
  label="Kategori" 
  options={options} 
  placeholder="Pilih kategori" 
/>
```

### Card
Komponen card untuk menampung konten.

```jsx
import { Card } from '../components';

// Penggunaan dasar
<Card>
  <p>Konten card</p>
</Card>

// Dengan header dan body
<Card>
  <Card.Header>
    <h3>Judul Card</h3>
  </Card.Header>
  <Card.Body>
    <p>Isi card</p>
  </Card.Body>
  <Card.Footer>
    <Button>Aksi</Button>
  </Card.Footer>
</Card>

// Dengan hover effect
<Card hover>
  <p>Card dengan hover effect</p>
</Card>
```

### Badge
Komponen badge untuk menampilkan status atau label.

```jsx
import { Badge } from '../components';

<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="ghost">Ghost</Badge>
<Badge variant="outline">Outline</Badge>
```

### Loading
Komponen loading dengan berbagai animasi.

```jsx
import { Loading } from '../components';

// Loading spinner
<Loading />

// Loading dengan teks
<Loading text="Memuat data..." />

// Loading dengan variant
<Loading variant="dots" />
<Loading variant="ring" />
<Loading variant="ball" />
<Loading variant="bars" />
<Loading variant="infinity" />

// Loading dengan ukuran
<Loading size="xs" />
<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />
```

## Komponen Molekul

### DataTable
Komponen tabel data yang dapat dikustomisasi.

```jsx
import { DataTable } from '../components';

const columns = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: 'Nama' },
  { key: 'status', title: 'Status', type: 'badge' },
  { key: 'created_at', title: 'Tanggal Dibuat', type: 'date' }
];

const data = [
  { id: 1, name: 'Item 1', status: 'active', created_at: '2024-01-01' },
  { id: 2, name: 'Item 2', status: 'inactive', created_at: '2024-01-02' }
];

<DataTable
  data={data}
  columns={columns}
  loading={false}
  onEdit={(item) => console.log('Edit:', item)}
  onDelete={(item) => console.log('Delete:', item)}
  onView={(item) => console.log('View:', item)}
/>
```

### Form
Komponen form yang menyediakan struktur dan validasi.

```jsx
import { Form } from '../components';

<Form onSubmit={handleSubmit} loading={isSubmitting}>
  <Form.Section title="Informasi Dasar">
    <Form.Row>
      <Form.Input
        label="Nama"
        placeholder="Masukkan nama"
        required
      />
      <Form.Input
        label="Email"
        type="email"
        placeholder="Masukkan email"
        required
      />
    </Form.Row>
    
    <Form.Textarea
      label="Deskripsi"
      placeholder="Masukkan deskripsi"
      rows={4}
    />
  </Form.Section>
</Form>
```

### Modal
Komponen modal untuk dialog dan konfirmasi.

```jsx
import { Modal } from '../components';

// Modal dasar
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Judul Modal"
>
  <p>Konten modal</p>
  <Modal.Footer>
    <Button variant="ghost" onClick={() => setShowModal(false)}>
      Batal
    </Button>
    <Button variant="primary">
      Simpan
    </Button>
  </Modal.Footer>
</Modal>

// Modal konfirmasi
<Modal.Confirm
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleConfirm}
  title="Konfirmasi Hapus"
  message="Apakah Anda yakin ingin menghapus item ini?"
  confirmText="Hapus"
  cancelText="Batal"
  variant="error"
/>
```

### Alert
Komponen alert untuk menampilkan pesan.

```jsx
import { Alert } from '../components';

// Alert dasar
<Alert type="success" title="Berhasil!">
  Data berhasil disimpan.
</Alert>

// Alert dengan komponen khusus
<Alert.Success title="Berhasil!">
  Data berhasil disimpan.
</Alert.Success>

<Alert.Error title="Error!">
  Terjadi kesalahan saat menyimpan data.
</Alert.Error>

<Alert.Warning title="Peringatan!">
  Pastikan semua field terisi dengan benar.
</Alert.Warning>

<Alert.Info title="Informasi">
  Ini adalah pesan informasi.
</Alert.Info>
```

## Penggunaan dalam Halaman

```jsx
import { 
  Button, 
  Input, 
  DataTable, 
  Modal, 
  Alert,
  Loading 
} from '../components';

export default function MyPage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState(null);

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Judul Halaman</h1>
        <Button variant="soft" onClick={() => setShowModal(true)}>
          Tambah Baru
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Memuat data..." />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Baru"
      >
        <Form onSubmit={handleSubmit}>
          <Form.Input
            label="Nama"
            placeholder="Masukkan nama"
            required
          />
        </Form>
      </Modal>
    </div>
  );
}
```

## Best Practices

1. **Konsistensi**: Gunakan komponen yang sama untuk fungsi yang sama
2. **Props**: Selalu berikan props yang diperlukan dan gunakan default values
3. **Accessibility**: Pastikan komponen mendukung accessibility (ARIA labels, keyboard navigation)
4. **Responsive**: Gunakan responsive classes untuk tampilan mobile
5. **Performance**: Gunakan React.memo untuk komponen yang sering re-render
6. **Testing**: Tulis test untuk komponen yang kompleks

## Customization

Semua komponen dapat dikustomisasi melalui:
- Props untuk mengubah behavior
- className untuk styling tambahan
- CSS variables untuk theming
- Tailwind classes untuk layout dan spacing
