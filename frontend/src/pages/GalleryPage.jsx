import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { getImageUrl } from '../utils/imageUrl.js';

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
          <figure key={g.id_galeri} className="overflow-hidden rounded shadow">
            <img 
              src={getImageUrl(g.gambar)} 
              alt={g.keterangan || 'Galeri'} 
              className="object-cover w-full h-48"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWJhciB0aWRhayBkYXBhdCBkaW11YXQ8L3RleHQ+PC9zdmc+';
              }}
            />
            {g.keterangan ? <figcaption className="p-2 text-sm">{g.keterangan}</figcaption> : null}
          </figure>
        ))}
      </div>
    </div>
  );
}


