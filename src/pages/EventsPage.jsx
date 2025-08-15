import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { EventCard } from '../components';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((event) => (
          <EventCard key={event.id_event} event={event} />
        ))}
      </div>
    </div>
  );
}


