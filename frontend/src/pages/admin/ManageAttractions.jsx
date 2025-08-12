import { useEffect, useRef, useState } from 'react';
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

export default function ManageAttractions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const dialogRef = useRef(null);

  function load() {
    setLoading(true);
    api.get('/admin/attractions').then((res) => setData(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    dialogRef.current?.showModal();
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      category_id: item.category_id || '',
      name: item.name || '',
      description: item.description || '',
      ticket_price: item.ticket_price || '',
      operational_hours: item.operational_hours || '',
      facilities: item.facilities || '',
      gmaps_iframe_url: item.gmaps_iframe_url || '',
      cover_image_url: item.cover_image_url || '',
    });
    dialogRef.current?.showModal();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
    };
    if (editingId) await api.put(`/admin/attractions/${editingId}`, payload);
    else await api.post('/admin/attractions', payload);
    dialogRef.current?.close();
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Hapus data ini?')) return;
    await api.delete(`/admin/attractions/${id}`);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kelola Objek Wisata</h1>
        <button className="btn btn-soft btn-primary text-white" onClick={openCreate}>Tambah</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner" /></div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-base-content/60">Tidak ada data</td>
                </tr>
              ) : (
                data.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.name}</td>
                    <td>{a.category_name || '-'}</td>
                    <td className="space-x-2">
                      <button className="btn btn-xs" onClick={() => openEdit(a)}>Edit</button>
                      <button className="btn btn-xs btn-error" onClick={() => handleDelete(a.id)}>Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-3">{editingId ? 'Edit' : 'Tambah'} Wisata</h3>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input type="text" placeholder="Nama" className="input input-bordered w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="number" placeholder="ID Kategori (opsional)" className="input input-bordered w-full" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
            <textarea placeholder="Deskripsi" className="textarea textarea-bordered w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Harga Tiket" className="input input-bordered w-full" value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: e.target.value })} />
              <input type="text" placeholder="Jam Operasional" className="input input-bordered w-full" value={form.operational_hours} onChange={(e) => setForm({ ...form, operational_hours: e.target.value })} />
            </div>
            <textarea placeholder="Fasilitas" className="textarea textarea-bordered w-full" value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} />
            <input type="text" placeholder="Google Maps Embed URL" className="input input-bordered w-full" value={form.gmaps_iframe_url} onChange={(e) => setForm({ ...form, gmaps_iframe_url: e.target.value })} />
            <input type="text" placeholder="Cover Image URL" className="input input-bordered w-full" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => dialogRef.current?.close()}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}


