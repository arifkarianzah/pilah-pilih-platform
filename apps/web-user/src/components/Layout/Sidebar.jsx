import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Recycle, ScanLine, Gift, User, BookOpen,
  MessageCircle, Wallet, Truck, History, LogOut, Leaf, X
} from "lucide-react";

function Sidebar({ onLogout, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuGroups = [
    {
      label: "Menu Utama",
      items: [
        { path: "/dashboard", icon: <Home size={20} />, label: "Beranda" },
        { path: "/jual-sampah", icon: <Recycle size={20} />, label: "Jual Sampah" },
        { path: "/pickup", icon: <Truck size={20} />, label: "Jemput Sampah" },
        { path: "/ai-scan", icon: <ScanLine size={20} />, label: "AI Scan" },
      ],
    },
    {
      label: "Keuangan",
      items: [
        { path: "/wallet", icon: <Wallet size={20} />, label: "Dompet" },
        { path: "/withdraw", icon: <Wallet size={20} />, label: "Tarik Saldo" },
        { path: "/history", icon: <History size={20} />, label: "Riwayat" },
      ],
    },
    {
      label: "Lainnya",
      items: [
        { path: "/reward", icon: <Gift size={20} />, label: "Reward" },
        { path: "/edukasi", icon: <BookOpen size={20} />, label: "Edukasi" },
        { path: "/chat", icon: <MessageCircle size={20} />, label: "Chat" },
        { path: "/profile", icon: <User size={20} />, label: "Profil Saya" },
      ],
    },
  ];

  return (
    <aside className={`user-sidebar ${isOpen ? "open" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand-wrap">
        <div className="sidebar-logo-icon">
          <Leaf size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <span className="sidebar-brand-name">PilahPilih</span>
          <span className="sidebar-brand-tagline">Daur Ulang, Raih Untung</span>
        </div>
        {onClose && (
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div key={group.label} className="sidebar-group">
            <span className="sidebar-group-label">{group.label}</span>
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive(item.path) ? "active" : ""}`}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer-wrap">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
