import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import HomePage from './pages/HomePage.jsx';
import AttractionsPage from './pages/AttractionsPage.jsx';
import AttractionDetailPage from './pages/AttractionDetailPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageAttractions from './pages/admin/ManageAttractions.jsx';

function RequireAuth() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/attractions" element={<AttractionsPage />} />
          <Route path="/attractions/:id" element={<AttractionDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/attractions" element={<ManageAttractions />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}


