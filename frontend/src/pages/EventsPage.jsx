import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function EventsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><span className="loading loading-spinner" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Event</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((e) => (
          <div className="card bg-base-100 shadow" key={e.id}>
            {e.image_url ? (
              <figure><img src={e.image_url} alt={e.name} className="h-40 w-full object-cover" /></figure>
            ) : null}
            <div className="card-body">
              <h3 className="card-title text-base">{e.name}</h3>
              <p className="text-sm opacity-80">{e.location || 'Bulukumba'} {e.event_date ? `• ${new Date(e.event_date).toLocaleDateString()}` : ''}</p>
              <p className="text-sm">{e.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


