import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function GalleryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gallery').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><span className="loading loading-spinner" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Galeri</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((g) => (
          <figure key={g.id} className="overflow-hidden rounded shadow">
            <img src={g.image_url} alt={g.caption || 'Galeri'} className="object-cover w-full h-48" />
            {g.caption ? <figcaption className="p-2 text-sm">{g.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </div>
  );
}


