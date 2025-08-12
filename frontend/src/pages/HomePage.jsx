import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import AttractionCard from '../components/AttractionCard.jsx';

export default function HomePage() {
  const [attractions, setAttractions] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/attractions'),
      api.get('/events'),
    ]).then(([aRes, eRes]) => {
      setAttractions(aRes.data.slice(0, 6));
      setEvents(eRes.data.slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-12">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Selamat Datang di Pariwisata Bulukumba</h1>
        <p className="opacity-80">Jelajahi keindahan alam, budaya, dan destinasi menarik di Bulukumba.</p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Destinasi Unggulan</h2>
          <Link to="/attractions" className="link link-primary">Lihat semua</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {attractions.map((a) => (
            <AttractionCard key={a.id} attraction={a} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Event Terbaru</h2>
          <Link to="/events" className="link link-primary">Lihat semua</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((e) => (
            <div className="card bg-base-100 shadow" key={e.id}>
              {e.image_url ? (
                <figure><img src={e.image_url} alt={e.name} className="h-40 w-full object-cover" /></figure>
              ) : null}
              <div className="card-body">
                <h3 className="card-title text-base">{e.name}</h3>
                <p className="text-sm opacity-80">{e.location || 'Bulukumba'} {e.event_date ? `• ${new Date(e.event_date).toLocaleDateString()}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


