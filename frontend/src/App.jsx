import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

import HomePage from './pages/HomePage.jsx';
import AttractionsPage from './pages/AttractionsPage.jsx';
import AttractionDetailPage from './pages/AttractionDetailPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageAttractions from './pages/admin/ManageAttractions.jsx';
import FormAttraction from './pages/admin/FormAttraction.jsx';
import ManageGallery from './pages/admin/ManageGallery.jsx';
import FormGallery from './pages/admin/FormGallery.jsx';
import ManageCategories from './pages/admin/ManageCategories.jsx';
import FormCategory from './pages/admin/FormCategory.jsx';

/**
 * ANCHOR: App
 * Defines application routes and separates public/admin areas using layout components.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/attractions" element={<AttractionsPage />} />
        <Route path="/attractions/:id" element={<AttractionDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/attractions" element={<ManageAttractions />} />
        <Route path="/admin/attractions/new" element={<FormAttraction />} />
        <Route path="/admin/attractions/:id/edit" element={<FormAttraction />} />
        <Route path="/admin/attractions/:wisataId/galleries" element={<ManageGallery />} />
        <Route path="/admin/attractions/:wisataId/galleries/new" element={<FormGallery />} />
        <Route path="/admin/attractions/:wisataId/galleries/:id/edit" element={<FormGallery />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/categories/new" element={<FormCategory />} />
        <Route path="/admin/categories/:id/edit" element={<FormCategory />} />
      </Route>
    </Routes>
  );
}


