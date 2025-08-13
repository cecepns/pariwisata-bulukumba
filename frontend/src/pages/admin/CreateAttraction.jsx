import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';

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
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
      };
      await api.post('/admin/attractions', payload);
      navigate('/admin/attractions', { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tambah Objek Wisata</h1>
        <Link to="/admin/attractions" className="btn">Kembali</Link>
      </div>

      <div className="rounded-box border border-base-content/5 bg-base-100 p-4">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nama"
            className="input input-bordered w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className="select select-bordered w-full"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            disabled={loadingCategories}
          >
            <option value="">Pilih Kategori (opsional)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Deskripsi"
            className="textarea textarea-bordered w-full"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Harga Tiket"
              className="input input-bordered w-full"
              value={form.ticket_price}
              onChange={(e) => setForm({ ...form, ticket_price: e.target.value })}
            />
            <input
              type="text"
              placeholder="Jam Operasional"
              className="input input-bordered w-full"
              value={form.operational_hours}
              onChange={(e) => setForm({ ...form, operational_hours: e.target.value })}
            />
          </div>
          <textarea
            placeholder="Fasilitas"
            className="textarea textarea-bordered w-full"
            value={form.facilities}
            onChange={(e) => setForm({ ...form, facilities: e.target.value })}
          />
          <input
            type="text"
            placeholder="Google Maps Embed URL"
            className="input input-bordered w-full"
            value={form.gmaps_iframe_url}
            onChange={(e) => setForm({ ...form, gmaps_iframe_url: e.target.value })}
          />
          <input
            type="text"
            placeholder="Cover Image URL"
            className="input input-bordered w-full"
            value={form.cover_image_url}
            onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
          />
          <div className="flex gap-2 justify-end pt-2">
            <Link to="/admin/attractions" className="btn" disabled={submitting}>Batal</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



