import { useState, useEffect } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { notifAPI } from '../services/api';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Selamat datang kembali, Admin!' },
  '/kelola-user': { title: 'Kelola User', sub: 'Manajemen pengguna aplikasi' },
  '/kelola-petugas': { title: 'Kelola Petugas', sub: 'Manajemen tim petugas lapangan' },
  '/kelola-pengepul': { title: 'Kelola Pengepul', sub: 'Manajemen mitra pengepul sampah' },
  '/jenis-sampah': { title: 'Jenis Sampah', sub: 'Kelola kategori jenis sampah' },
  '/harga-sampah': { title: 'Harga Sampah', sub: 'Kelola harga per jenis sampah' },
  '/penarikan-saldo': { title: 'Penarikan Saldo', sub: 'Kelola permintaan penarikan saldo user' },
  '/monitoring-sampah': { title: 'Monitoring Sampah', sub: 'Pantau alur sampah masuk' },
  '/penjemputan': { title: 'Monitoring Penjemputan', sub: 'Status penjemputan sampah' },
  '/keuangan': { title: 'Keuangan', sub: 'Laporan keuangan sistem' },
  '/laporan': { title: 'Laporan', sub: 'Laporan & ekspor data' },
  '/notifikasi': { title: 'Notifikasi', sub: 'Notifikasi sistem dan aktivitas' },
  '/pusat-bantuan': { title: 'Pusat Bantuan', sub: 'Kelola tiket & keluhan user' },
  '/pengaturan': { title: 'Pengaturan', sub: 'Konfigurasi sistem aplikasi' },
};

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageTitles[location.pathname] || { title: 'Pilah Pilih', sub: 'Admin Panel' };
  
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notifAPI.getAll();
        if (res.success) {
          const unread = res.data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Gagal mengambil notifikasi:', err);
      }
    };
    fetchUnread();
    
    // Auto refresh unread count every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="topbar">
      <button className="topbar-toggle" onClick={onToggleSidebar} id="topbar-menu-btn">
        <Menu size={20} />
      </button>

      <div className="topbar-breadcrumb">
        <h2>{page.title}</h2>
        <p>{page.sub}</p>
      </div>

      <div className="topbar-right">
        {/* Tombol Search (bisa diarahkah ke pencarian global nanti) */}
        <button className="topbar-icon-btn" id="topbar-search-btn" title="Cari">
          <Search size={18} />
        </button>
        
        {/* Tombol Notifikasi */}
        <button 
          className="topbar-icon-btn" 
          id="topbar-notif-btn" 
          title="Notifikasi"
          onClick={() => navigate('/notifikasi')}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="topbar-notif-badge">{unreadCount}</span>}
        </button>
        
        <div className="topbar-admin" onClick={() => navigate('/pengaturan')} style={{ cursor: 'pointer' }} title="Pengaturan Akun">
          <div className="topbar-admin-avatar">A</div>
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
}
