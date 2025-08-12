import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';

/**
 * ANCHOR: AdminLayout
 * Protects admin pages by requiring a token, and renders shared layout for admin area.
 */
const adminNavItems = [
  { to: '/admin', label: 'Dasbor' },
  { to: '/admin/attractions', label: 'Kelola Objek Wisata' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return <Navigate to="/admin/login" replace />;

  /**
   * ANCHOR: handleLogout
   * Clears auth token and redirects to admin login page.
   */
  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/admin/login', { replace: true });
  }

  const linkClass = ({ isActive }) => `justify-start ${isActive ? 'font-semibold' : ''}`;

  return (
    <div className="min-h-screen flex bg-base-100">
      <aside className="w-64 bg-base-200 border-r hidden md:flex flex-col">
        <div className="p-4 border-b">
          <div className="text-lg font-bold">Admin Panel</div>
        </div>
        <ul className="menu p-2 flex-1">
          {adminNavItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={linkClass}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t">
          <button className="btn btn-error btn-sm w-full" onClick={handleLogout}>Keluar</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="navbar bg-base-100 border-b">
          <div className="flex-1 px-4">
            <span className="font-semibold">Dashboard Admin</span>
          </div>
          <div className="flex-none px-4 md:hidden">
            <button className="btn btn-error btn-sm" onClick={handleLogout}>Keluar</button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


