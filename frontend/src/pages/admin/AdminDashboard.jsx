import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dasbor Admin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link className="btn" to="/admin/attractions">Kelola Objek Wisata</Link>
        <Link className="btn btn-outline" to="/events">Lihat Event Publik</Link>
        <Link className="btn btn-outline" to="/gallery">Lihat Galeri Publik</Link>
      </div>
    </div>
  );
}


