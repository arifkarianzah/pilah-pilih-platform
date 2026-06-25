import { useLocation, Link } from 'react-router-dom';
import { FiBell, FiUser, FiMenu } from 'react-icons/fi';

const pageTitles = {
  '/': { title: 'Dashboard Overview', sub: 'Selamat datang kembali 👋' },
  '/sampah-masuk': { title: 'Sampah Masuk', sub: 'Kiriman sampah dari petugas lapangan' },
  '/inventori': { title: 'Inventori Sampah', sub: 'Kelola stok sampah gudang Anda' },
  '/kiriman-petugas': { title: 'Kiriman Petugas', sub: 'Performa dan ranking petugas lapangan' },
  '/penjualan-pabrik': { title: 'Penjualan ke Pabrik', sub: 'Transaksi penjualan sampah ke pabrik' },
  '/keuangan': { title: 'Laporan Keuangan', sub: 'Rekap pemasukan, pengeluaran dan laba' },
  '/statistik': { title: 'Statistik & Grafik', sub: 'Analisis data pengepul secara visual' },
  '/laporan': { title: 'Laporan', sub: 'Generate dan export laporan' },
  '/notifikasi': { title: 'Notifikasi', sub: 'Semua pemberitahuan terbaru' },
  '/chat': { title: 'Chat', sub: 'Komunikasi dengan admin dan petugas' },
  '/profil': { title: 'Profil Pengepul', sub: 'Kelola data perusahaan Anda' },
  '/pengaturan': { title: 'Pengaturan', sub: 'Keamanan dan konfigurasi akun' },
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'PengepulPanel', sub: '' };
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = (user.name || 'P').charAt(0).toUpperCase();

  return (
    <div className="top-header">
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="header-icon-btn mobile-menu-btn" onClick={onMenuClick} title="Menu">
          <FiMenu />
        </button>
        <div>
          <div className="header-title">{pageInfo.title}</div>
          {pageInfo.sub && <div className="header-breadcrumb">{pageInfo.sub}</div>}
        </div>
      </div>

      <div className="header-right">
        {/* Notifikasi Bell */}
        <Link to="/notifikasi" className="header-icon-btn" title="Notifikasi">
          <FiBell />
        </Link>

        {/* Profil Avatar */}
        <Link to="/profil" className="header-avatar" title="Profil">
          {initial}
        </Link>

        <div className="header-user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.3 }}>
            {user.name || 'Admin Pengepul'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--success)' }}>● Online</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
