import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { Form, Button, Card } from '../../components';

const emptyForm = {
  nama_event: '',
  deskripsi_event: '',
  tempat: '',
  tanggal_mulai: '',
  gambar_event: '',
};

/**
 * ANCHOR: FormEvent
 * Renders a dedicated page to create or edit an event (no modal usage).
 */
export default function FormEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEditing);

  // Fetch event data if editing
  useEffect(() => {
    if (isEditing) {
      async function fetchEvent() {
        try {
          const response = await api.get(`/admin/events/${id}`);
          const event = response.data;
          setForm({
            nama_event: event.nama_event || '',
            deskripsi_event: event.deskripsi_event || '',
            tempat: event.tempat || '',
            tanggal_mulai: event.tanggal_mulai ? event.tanggal_mulai.split('T')[0] : '',
            gambar_event: event.gambar_event || '',
          });
        } catch (error) {
          console.error('Error fetching event:', error);
          toast.error('Gagal memuat data event');
        } finally {
          setLoadingEvent(false);
        }
      }
      fetchEvent();
    }
  }, [id, isEditing]);

  /**
   * ANCHOR: handleSubmit
   * Posts a new event or updates existing one and navigates back to listing.
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        name: form.nama_event,
        description: form.deskripsi_event,
        location: form.tempat,
        event_date: form.tanggal_mulai,
        image_url: form.gambar_event,
      };

      if (isEditing) {
        await api.put(`/admin/events/${id}`, payload);
        toast.success('Event berhasil diperbarui');
      } else {
        await api.post('/admin/events', payload);
        toast.success('Event berhasil ditambahkan');
      }

      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(isEditing ? 'Gagal memperbarui event. Silakan coba lagi.' : 'Gagal menambahkan event. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEditing ? 'Edit Event' : 'Tambah Event'}
        </h1>
        <Link to="/admin/events">
          <Button variant="ghost">Kembali</Button>
        </Link>
      </div>

      <Card>
        <Form onSubmit={handleSubmit} loading={submitting} submitText={isEditing ? "Update" : "Simpan"}>
          <Form.Section title="Informasi Event">
            <Form.Input
              label="Nama Event"
              placeholder="Masukkan nama event"
              value={form.nama_event}
              onChange={(e) => setForm({ ...form, nama_event: e.target.value })}
              required
            />
            
            <Form.Textarea
              label="Deskripsi Event"
              placeholder="Masukkan deskripsi event"
              value={form.deskripsi_event}
              onChange={(e) => setForm({ ...form, deskripsi_event: e.target.value })}
              rows={4}
              helperText="Deskripsi lengkap tentang event ini"
            />

            <Form.Input
              label="Tempat"
              placeholder="Masukkan lokasi event"
              value={form.tempat}
              onChange={(e) => setForm({ ...form, tempat: e.target.value })}
              helperText="Lokasi atau tempat dilaksanakannya event"
            />

            <Form.Input
              label="Tanggal Event"
              type="date"
              value={form.tanggal_mulai}
              onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
              helperText="Tanggal pelaksanaan event"
            />

            <Form.Input
              label="URL Gambar"
              placeholder="https://example.com/image.jpg"
              value={form.gambar_event}
              onChange={(e) => setForm({ ...form, gambar_event: e.target.value })}
              helperText="URL gambar untuk event (opsional)"
            />
          </Form.Section>
        </Form>
      </Card>
    </div>
  );
}
