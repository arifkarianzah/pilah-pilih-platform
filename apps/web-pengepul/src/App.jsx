import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import { ToastContainer } from './components/UI/Toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SampahMasuk from './pages/SampahMasuk';
import Inventori from './pages/Inventori';
import KirimanPetugas from './pages/KirimanPetugas';
import PenjualanPabrik from './pages/PenjualanPabrik';
import Keuangan from './pages/Keuangan';
import Statistik from './pages/Statistik';
import Laporan from './pages/Laporan';
import Notifikasi from './pages/Notifikasi';
import Chat from './pages/Chat';
import Profil from './pages/Profil';
import Pengaturan from './pages/Pengaturan';
import TambahPetugas from './pages/TambahPetugas';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-color)', flexDirection: 'column', gap: 16, color: 'var(--text-muted)'
      }}>
        <div style={{
          width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }}></div>
        <span>Memuat PengepulPanel...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={user ? <Layout onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="sampah-masuk" element={<SampahMasuk />} />
          <Route path="inventori" element={<Inventori />} />
          <Route path="kiriman-petugas" element={<KirimanPetugas />} />
          <Route path="penjualan-pabrik" element={<PenjualanPabrik />} />
          <Route path="keuangan" element={<Keuangan />} />
          <Route path="statistik" element={<Statistik />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="notifikasi" element={<Notifikasi />} />
          <Route path="chat" element={<Chat />} />
          <Route path="tambah-petugas" element={<TambahPetugas />} />
          <Route path="profil" element={<Profil />} />
          <Route path="pengaturan" element={<Pengaturan />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
