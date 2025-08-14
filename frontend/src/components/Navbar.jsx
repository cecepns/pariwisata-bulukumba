import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) => `px-3 py-2 rounded-md ${isActive ? 'font-semibold' : ''}`;

  return (
    <div className="navbar bg-base-100 border-b">
      <div className="container mx-auto">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">Bulukumba Tourism</Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1 items-center">
            <li><NavLink to="/" className={linkClass}>Beranda</NavLink></li>
            <li><NavLink to="/attractions" className={linkClass}>Wisata</NavLink></li>
            <li><NavLink to="/events" className={linkClass}>Event</NavLink></li>
            <li><NavLink to="/gallery" className={linkClass}>Galeri</NavLink></li>
          </ul>
        </div>
      </div>
    </div>
  );
}


