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
        <h1 className="text-3xl font-bold">{data.name}</h1>
        {data.category_name ? <div className="badge badge-outline">{data.category_name}</div> : null}
      </div>

      {data.cover_image_url ? (
        <img src={data.cover_image_url} alt={data.name} className="w-full max-h-[420px] object-cover rounded" />
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <p className="leading-relaxed whitespace-pre-line">{data.description}</p>
          {data.gmaps_iframe_url ? (
            <div className="aspect-video w-full">
              <iframe
                src={data.gmaps_iframe_url}
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
          {data.ticket_price ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Harga Tiket</h3>
                <p>{data.ticket_price}</p>
              </div>
            </div>
          ) : null}
          {data.operational_hours ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Jam Operasional</h3>
                <p>{data.operational_hours}</p>
              </div>
            </div>
          ) : null}
          {data.facilities ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Fasilitas</h3>
                <p className="whitespace-pre-line">{data.facilities}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}


