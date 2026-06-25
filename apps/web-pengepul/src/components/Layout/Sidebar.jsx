import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  FiHome, FiInbox, FiBox, FiTruck, FiShoppingCart,
  FiDollarSign, FiBarChart2, FiFileText, FiBell,
  FiMessageSquare, FiUser, FiSettings, FiLogOut
} from 'react-icons/fi';
import { getNotifications } from '../../api/pengepulAPI';

const Sidebar = ({ onLogout, isOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [unreadNotif, setUnreadNotif] = useState(0);

  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const res = await getNotifications();
        const unread = res.data.notifications ? res.data.notifications.filter(n => !n.is_read).length : 0;
        setUnreadNotif(unread);
      } catch {
        setUnreadNotif(0);
      }
    };
    fetchNotif();
    const interval = setInterval(fetchNotif, 60000);
    return () => clearInterval(interval);
  }, []);

  const menuGroups = [
    {
      label: 'Utama',
      items: [
        { path: '/', name: 'Dashboard', icon: <FiHome /> },
        { path: '/sampah-masuk', name: 'Sampah Masuk', icon: <FiInbox /> },
        { path: '/inventori', name: 'Inventori Sampah', icon: <FiBox /> },
      ]
    },
    {
      label: 'Operasional',
      items: [
        { path: '/kiriman-petugas', name: 'Kiriman Petugas', icon: <FiTruck /> },
        { path: '/penjualan-pabrik', name: 'Penjualan Pabrik', icon: <FiShoppingCart /> },
        { path: '/keuangan', name: 'Keuangan', icon: <FiDollarSign /> },
      ]
    },
    {
      label: 'Analitik',
      items: [
        { path: '/statistik', name: 'Statistik', icon: <FiBarChart2 /> },
        { path: '/laporan', name: 'Laporan', icon: <FiFileText /> },
      ]
    },
    {
      label: 'Komunikasi',
      items: [
        { path: '/notifikasi', name: 'Notifikasi', icon: <FiBell />, badge: unreadNotif },
        { path: '/chat', name: 'Chat', icon: <FiMessageSquare /> },
      ]
    },
    {
      label: 'Akun',
      items: [
        { path: '/profil', name: 'Profil', icon: <FiUser /> },
        { path: '/pengaturan', name: 'Pengaturan', icon: <FiSettings /> },
      ]
    },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleMenuClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">♻️</div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">PengepulPanel</span>
          <span className="sidebar-brand-sub">Dashboard v2.0</span>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="sidebar-menu">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <div className="sidebar-section-label">{group.label}</div>
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuClick}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.name}</span>
                {item.badge > 0 && (
                  <span className="menu-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Footer Logout */}
      <div className="sidebar-footer">
        <button
          className="menu-item btn-ghost"
          style={{ width: '100%', border: 'none', cursor: 'pointer', color: 'var(--danger)', background: 'rgba(239,68,68,0.05)' }}
          onClick={() => {
            handleMenuClick();
            onLogout();
          }}
        >
          <span className="menu-icon"><FiLogOut /></span>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
