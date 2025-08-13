import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';

export default function AttractionDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/attractions/${id}`).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-10"><span className="loading loading-spinner" /></div>;
  if (!data) return <div>Data tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{data.nama_wisata}</h1>
        {data.nama_kategori ? <div className="badge badge-outline">{data.nama_kategori}</div> : null}
      </div>

      {data.cover_image_url ? (
        <img src={data.cover_image_url} alt={data.nama_wisata} className="w-full max-h-[420px] object-cover rounded" />
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <p className="leading-relaxed whitespace-pre-line">{data.deskripsi}</p>
          {data.peta_wisata ? (
            <div className="aspect-video w-full">
              <iframe
                src={data.peta_wisata}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi di Google Maps"
              />
            </div>
          ) : null}
        </div>

        <aside className="space-y-3">
          {data.harga_tiket ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Harga Tiket</h3>
                <p>{data.harga_tiket}</p>
              </div>
            </div>
          ) : null}
          {data.jam_operasional ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Jam Operasional</h3>
                <p>{data.jam_operasional}</p>
              </div>
            </div>
          ) : null}
          {data.fasilitas ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Fasilitas</h3>
                <p className="whitespace-pre-line">{data.fasilitas}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}


