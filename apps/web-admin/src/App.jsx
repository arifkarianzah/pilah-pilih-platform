import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KelolaUser from './pages/KelolaUser';
import KelolaPetugas from './pages/KelolaPetugas';
import KelolaPengepul from './pages/KelolaPengepul';
import JenisSampah from './pages/JenisSampah';
import HargaSampah from './pages/HargaSampah';
import PenarikanSaldo from './pages/PenarikanSaldo';
import MonitoringSampah from './pages/MonitoringSampah';
import Penjemputan from './pages/Penjemputan';
import Keuangan from './pages/Keuangan';
import Laporan from './pages/Laporan';
import Notifikasi from './pages/Notifikasi';
import PusatBantuan from './pages/PusatBantuan';
import Pengaturan from './pages/Pengaturan';

// ─── Auth Guard ────────────────────────────────────────────────────────────────
function RequireAdmin() {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  if (!token || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// ─── Admin Layout ──────────────────────────────────────────────────────────────
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <Topbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <Outlet />
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected admin routes */}
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/kelola-user"        element={<KelolaUser />} />
            <Route path="/kelola-petugas"     element={<KelolaPetugas />} />
            <Route path="/kelola-pengepul"    element={<KelolaPengepul />} />
            <Route path="/jenis-sampah"       element={<JenisSampah />} />
            <Route path="/harga-sampah"       element={<HargaSampah />} />
            <Route path="/penarikan-saldo"    element={<PenarikanSaldo />} />
            <Route path="/monitoring-sampah"  element={<MonitoringSampah />} />
            <Route path="/penjemputan"        element={<Penjemputan />} />
            <Route path="/keuangan"           element={<Keuangan />} />
            <Route path="/laporan"            element={<Laporan />} />
            <Route path="/notifikasi"         element={<Notifikasi />} />
            <Route path="/pusat-bantuan"      element={<PusatBantuan />} />
            <Route path="/pengaturan"         element={<Pengaturan />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
