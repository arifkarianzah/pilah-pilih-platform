import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Truck, Recycle, Trash2, DollarSign,
  CreditCard, Package, ClipboardList, Wallet, BarChart3,
  Bell, MessageSquare, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { notifAPI, withdrawalAPI } from '../services/api';

const navItems = [
  { group: 'Utama', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/notifikasi', icon: Bell, label: 'Notifikasi', badgeKey: 'notif' },
  ]},
  { group: 'Manajemen', items: [
    { to: '/kelola-user', icon: Users, label: 'Kelola User' },
    { to: '/kelola-petugas', icon: Truck, label: 'Kelola Petugas' },
    { to: '/kelola-pengepul', icon: Recycle, label: 'Kelola Pengepul' },
  ]},
  { group: 'Sampah & Harga', items: [
    { to: '/jenis-sampah', icon: Trash2, label: 'Jenis Sampah' },
    { to: '/harga-sampah', icon: DollarSign, label: 'Harga Sampah' },
  ]},
  { group: 'Operasional', items: [
    { to: '/penarikan-saldo', icon: CreditCard, label: 'Penarikan Saldo', badgeKey: 'withdraw' },
    { to: '/monitoring-sampah', icon: Package, label: 'Monitoring Sampah' },
    { to: '/penjemputan', icon: ClipboardList, label: 'Penjemputan' },
  ]},
  { group: 'Keuangan & Laporan', items: [
    { to: '/keuangan', icon: Wallet, label: 'Keuangan' },
    { to: '/laporan', icon: BarChart3, label: 'Laporan' },
  ]},
  { group: 'Lainnya', items: [
    { to: '/pusat-bantuan', icon: MessageSquare, label: 'Pusat Bantuan' },
    { to: '/pengaturan', icon: Settings, label: 'Pengaturan' },
  ]},
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [badges, setBadges] = useState({ notif: 0, withdraw: 0 });

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [resNotif, resWd] = await Promise.all([
          notifAPI.getAll(),
          withdrawalAPI.getAll()
        ]);
        let notifCount = 0;
        let wdCount = 0;
        
        if (resNotif.success) {
          notifCount = resNotif.data.filter(n => !n.is_read).length;
        }
        if (resWd.success) {
          wdCount = resWd.data.filter(w => w.status === 'pending').length;
        }
        
        setBadges({ notif: notifCount, withdraw: wdCount });
      } catch (err) {
        // Abaikan error fetch background
      }
    };
    
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Refresh saat pindah halaman

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-inner">
            <div className="sidebar-logo-icon">♻️</div>
            <div>
              <h1>Pilah Pilih</h1>
              <p>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((group) => (
            <div key={group.group}>
              <div className="sidebar-section-title">{group.group}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to ||
                  (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                  
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
                
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="sidebar-link-icon">
                      <Icon size={18} />
                    </span>
                    <span className="sidebar-link-text">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="sidebar-badge">{badgeCount}</span>
                    )}
                    {badgeCount === 0 && isActive && (
                      <ChevronRight size={14} style={{ opacity: 0.6 }} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
              <h4>Admin</h4>
              <p>Super Admin</p>
            </div>
            <LogOut 
              size={16} 
              style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 'auto', cursor: 'pointer' }} 
              onClick={handleLogout}
              title="Keluar"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
