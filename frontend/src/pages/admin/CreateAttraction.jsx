import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import { Form, Button, Card, Alert } from '../../components';

const emptyForm = {
  category_id: '',
  name: '',
  description: '',
  ticket_price: '',
  operational_hours: '',
  facilities: '',
  gmaps_iframe_url: '',
  cover_image_url: '',
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
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            
            <Form.Select
              label="Kategori"
              placeholder="Pilih kategori (opsional)"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              disabled={loadingCategories}
            />
            
            <Form.Textarea
              label="Deskripsi"
              placeholder="Masukkan deskripsi objek wisata"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </Form.Section>

          <Form.Section title="Informasi Tiket & Operasional">
            <Form.Row>
              <Form.Input
                label="Harga Tiket"
                placeholder="Contoh: Rp 50.000"
                value={form.ticket_price}
                onChange={(e) => setForm({ ...form, ticket_price: e.target.value })}
              />
              <Form.Input
                label="Jam Operasional"
                placeholder="Contoh: 08:00 - 17:00"
                value={form.operational_hours}
                onChange={(e) => setForm({ ...form, operational_hours: e.target.value })}
              />
            </Form.Row>
          </Form.Section>

          <Form.Section title="Fasilitas & Media">
            <Form.Textarea
              label="Fasilitas"
              placeholder="Daftar fasilitas yang tersedia"
              value={form.facilities}
              onChange={(e) => setForm({ ...form, facilities: e.target.value })}
              rows={3}
            />
            
            <Form.Input
              label="Google Maps Embed URL"
              placeholder="URL embed dari Google Maps"
              value={form.gmaps_iframe_url}
              onChange={(e) => setForm({ ...form, gmaps_iframe_url: e.target.value })}
              helperText="Paste URL embed dari Google Maps"
            />
            
            <Form.Input
              label="Cover Image URL"
              placeholder="URL gambar cover"
              value={form.cover_image_url}
              onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
              helperText="URL gambar yang akan ditampilkan sebagai cover"
            />
          </Form.Section>
        </Form>
      </Card>
    </div>
  );
}



