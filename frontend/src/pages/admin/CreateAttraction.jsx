import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import { Form, Button, Card, Alert } from '../../components';

const emptyForm = {
  id_kategori: '',
  nama_wisata: '',
  deskripsi: '',
  harga_tiket: '',
  jam_operasional: '',
  fasilitas: '',
  peta_wisata: '',
  keterangan: '',
};

/**
 * ANCHOR: CreateAttraction
 * Renders a dedicated page to create a new attraction (no modal usage).
 */
export default function CreateAttraction() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [alert, setAlert] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get('/admin/categories');
        console.log('Categories response:', response.data);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  /**
   * ANCHOR: handleSubmit
   * Posts a new attraction to the server and navigates back to listing.
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setAlert(null);
    
    try {
      const payload = {
        category_id: form.id_kategori ? Number(form.id_kategori) : null,
        name: form.nama_wisata,
        description: form.deskripsi,
        ticket_price: form.harga_tiket,
        operational_hours: form.jam_operasional,
        facilities: form.fasilitas,
        gmaps_iframe_url: form.peta_wisata,
        keterangan: form.keterangan,
      };
      await api.post('/admin/attractions', payload);
      setAlert({
        type: 'success',
        title: 'Berhasil!',
        message: 'Objek wisata berhasil ditambahkan.'
      });
      setTimeout(() => {
        navigate('/admin/attractions', { replace: true });
      }, 1500);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error!',
        message: 'Gagal menambahkan objek wisata. Silakan coba lagi.'
      });
    } finally {
      setSubmitting(false);
    }
  }

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

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tambah Objek Wisata</h1>
        <Link to="/admin/attractions">
          <Button variant="ghost">Kembali</Button>
        </Link>
      </div>

      <Card>
        <Form onSubmit={handleSubmit} loading={submitting} submitText="Simpan">
          <Form.Section title="Informasi Dasar">
            <Form.Input
              label="Nama Objek Wisata"
              placeholder="Masukkan nama objek wisata"
              value={form.nama_wisata}
              onChange={(e) => setForm({ ...form, nama_wisata: e.target.value })}
              required
            />
            
            <Form.Select
              label="Kategori"
              placeholder="Pilih kategori"
              value={form.id_kategori}
              onChange={(e) => setForm({ ...form, id_kategori: e.target.value })}
              options={categories.map(cat => {
                console.log('Mapping category:', cat);
                return { value: cat.id, label: cat.name };
              })}
              disabled={loadingCategories}
              required
            />

            
            <Form.Textarea
              label="Deskripsi"
              placeholder="Masukkan deskripsi objek wisata"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={4}
            />
          </Form.Section>

          <Form.Section title="Informasi Tiket & Operasional">
            <Form.Row>
              <Form.Input
                label="Harga Tiket"
                placeholder="Contoh: Rp 50.000"
                value={form.harga_tiket}
                onChange={(e) => setForm({ ...form, harga_tiket: e.target.value })}
              />
              <Form.Input
                label="Jam Operasional"
                placeholder="Contoh: 08:00 - 17:00"
                value={form.jam_operasional}
                onChange={(e) => setForm({ ...form, jam_operasional: e.target.value })}
              />
            </Form.Row>
          </Form.Section>

          <Form.Section title="Fasilitas & Media">
            <Form.Textarea
              label="Fasilitas"
              placeholder="Daftar fasilitas yang tersedia"
              value={form.fasilitas}
              onChange={(e) => setForm({ ...form, fasilitas: e.target.value })}
              rows={3}
            />
            
            <Form.Textarea
              label="Peta Wisata"
              placeholder="Paste script iframe dari Google Maps atau peta lainnya"
              value={form.peta_wisata}
              onChange={(e) => setForm({ ...form, peta_wisata: e.target.value })}
              rows={4}
              helperText="Paste script iframe lengkap dari Google Maps atau peta lainnya"
            />
            
            <Form.Textarea
              label="Keterangan"
              placeholder="Informasi tambahan atau catatan khusus"
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              rows={3}
              helperText="Informasi tambahan yang ingin ditampilkan"
            />
          </Form.Section>
        </Form>
      </Card>
    </div>
  );
}



