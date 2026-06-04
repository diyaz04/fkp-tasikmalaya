/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { useAuthStore } from '@/src/store/authStore';

// Pages
import LandingPage from '@/src/pages/LandingPage';
import UMKMDirectory from '@/src/pages/UMKMDirectory';
import NewsList from '@/src/pages/NewsList';
import NewsDetail from '@/src/pages/NewsDetail';
import PKDetail from '@/src/pages/PKDetail';
import Login from '@/src/pages/Login';

// Dashboards
import DPDDashboard from '@/src/pages/dashboard/DPDDashboard';
import PKDashboard from '@/src/pages/dashboard/PKDashboard';

// Public Layout Wrapper including Navbar & Footer
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <Routes>
        
        {/* Public Visitor Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/umkm" element={<UMKMDirectory />} />
          <Route path="/berita" element={<NewsList />} />
          <Route path="/berita/:id" element={<NewsDetail />} />
          <Route path="/pk/:id" element={<PKDetail />} />
        </Route>

        {/* Administrative Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DPDDashboard />} />
        <Route path="/dashboard-pk" element={<PKDashboard />} />

        {/* Fallback Catch-all redirection */}
        <Route path="*" element={<LandingPage />} />

      </Routes>
    </Router>
  );
}
