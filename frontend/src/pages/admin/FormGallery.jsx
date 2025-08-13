import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';
import { Button, Input, Textarea, Select } from '../../components';

export default function FormGallery() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [attractions, setAttractions] = useState([]);
  const [formData, setFormData] = useState({
    gambar: '',
    keterangan: '',
    id_wisata: ''
  });

  useEffect(() => {
    // Load attractions for dropdown
    api.get('/admin/attractions').then((res) => {
      setAttractions(res.data);
    });

    // Load gallery data if editing
    if (isEdit) {
      api.get(`/admin/galleries/${id}`).then((res) => {
        setFormData(res.data);
      });
    } else {
      // Pre-fill wisata if provided in URL
      const wisataId = searchParams.get('wisata');
      if (wisataId) {
        setFormData(prev => ({
          ...prev,
          id_wisata: wisataId
        }));
      }
    }
  }, [id, isEdit, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/admin/galleries/${id}`, formData);
      } else {
        await api.post('/admin/galleries', formData);
      }
      navigate('/admin/galleries');
    } catch (error) {
      console.error('Error saving gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {isEdit ? 'Edit Galeri' : 'Tambah Galeri'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">URL Gambar</span>
          </label>
          <Input
            name="gambar"
            value={formData.gambar}
            onChange={handleChange}
            placeholder="Masukkan URL gambar"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Keterangan</span>
          </label>
          <Textarea
            name="keterangan"
            value={formData.keterangan}
            onChange={handleChange}
            placeholder="Masukkan keterangan gambar"
            rows={3}
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Objek Wisata</span>
          </label>
          <Select
            name="id_wisata"
            value={formData.id_wisata}
            onChange={handleChange}
            required
          >
            <option value="">Pilih objek wisata</option>
            {attractions.map((attraction) => (
              <option key={attraction.id_wisata} value={attraction.id_wisata}>
                {attraction.nama_wisata}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/galleries')}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {isEdit ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
