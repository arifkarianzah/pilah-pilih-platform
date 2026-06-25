import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, History,
  User, Scale, LogOut, Recycle, ShieldCheck
} from "lucide-react";
import { logout } from "../services/authService";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/orders", icon: ClipboardList, label: "Order Masuk" },
  { to: "/riwayat", icon: History, label: "Riwayat" },
  { to: "/timbang", icon: Scale, label: "Timbang" },
  { to: "/profil", icon: User, label: "Profil" },
];

function Sidebar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "P";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Recycle size={22} />
        </div>
        <div className="sidebar-logo-text">
          <strong>Pilah Pilih</strong>
          <span>Petugas Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Menu Utama</span>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <span className="nav-icon"><Icon size={18} /></span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user block */}
      <div className="sidebar-bottom">
        <div className="sidebar-user" onClick={() => navigate("/profil")}>
          <div className="sidebar-avatar">
            {initial}
          </div>
          <div className="sidebar-user-info">
            <strong>{user?.name || "Petugas"}</strong>
            <span><ShieldCheck size={11} style={{ marginRight: 3, verticalAlign: -2 }} />Petugas Aktif</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: "100%", marginTop: "0.5rem", color: "#f87171", background: "rgba(239,68,68,0.07)", border: "none" }}
        >
          <span className="nav-icon"><LogOut size={18} /></span>
          Keluar
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
