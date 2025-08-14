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
      console.log(aRes.data);
      setAttractions(aRes.data.slice(0, 6));
      setEvents(eRes.data.slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-screen flex items-center justify-center text-center rounded-3xl overflow-hidden mx-4 my-8"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-4xl mx-auto space-y-6 text-white">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Selamat Datang di Pariwisata Bulukumba
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              Jelajahi keindahan alam, budaya, dan destinasi menarik di Bulukumba
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link 
                to="/attractions" 
                className="btn btn-primary btn-lg text-white px-8 py-3 rounded-full hover:scale-105 transition-transform"
              >
                Jelajahi Destinasi
              </Link>
              <Link 
                to="/events" 
                className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-black px-8 py-3 rounded-full hover:scale-105 transition-transform"
              >
                Lihat Event
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Destinasi Unggulan</h2>
          <Link to="/attractions" className="link link-primary">Lihat semua</Link>
        </div>
        {attractions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {attractions.map((a) => (
              <AttractionCard key={a.id_wisata} attraction={a} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Destinasi</h3>
              <p className="text-gray-500 mb-4">Saat ini belum ada destinasi wisata yang tersedia. Silakan cek kembali nanti.</p>
              <Link to="/attractions" className="btn btn-primary">
                Lihat Semua Destinasi
              </Link>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Event Terbaru</h2>
          <Link to="/events" className="link link-primary">Lihat semua</Link>
        </div>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((e) => (
              <div className="card bg-base-100 shadow" key={e.id_event}>
                {e.gambar_event ? (
                  <figure><img src={e.gambar_event} alt={e.nama_event} className="h-40 w-full object-cover" /></figure>
                ) : null}
                <div className="card-body">
                  <h3 className="card-title text-base">{e.nama_event}</h3>
                  <p className="text-sm opacity-80">{e.tempat || 'Bulukumba'} {e.tanggal_mulai ? `• ${new Date(e.tanggal_mulai).toLocaleDateString()}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Event</h3>
              <p className="text-gray-500 mb-4">Saat ini belum ada event yang tersedia. Silakan cek kembali nanti.</p>
              <Link to="/events" className="btn btn-primary">
                Lihat Semua Event
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


