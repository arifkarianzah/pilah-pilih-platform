import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Recycle, ScanLine, Gift, User } from "lucide-react";
import Sidebar from "./Layout/Sidebar";

function BottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "active" : "";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen(true);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  return (
    <>
      {/* ── Global Sidebar ── */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="bottom-nav">
        <Link to="/dashboard" className={`nav-item ${isActive("/dashboard")}`}>
          <Home size={22} />
          <span>Beranda</span>
        </Link>

        <Link to="/jual-sampah" className={`nav-item ${isActive("/jual-sampah")}`}>
          <Recycle size={22} />
          <span>Jual Sampah</span>
        </Link>

        <div className="nav-item-center">
          <Link to="/ai-scan" className="fab-button">
            <ScanLine size={38} color="#064e3b" />
          </Link>
        </div>

        <Link to="/reward" className={`nav-item ${isActive("/reward")}`}>
          <Gift size={22} />
          <span>Reward</span>
        </Link>

        <Link to="/profile" className={`nav-item ${isActive("/profile")}`}>
          <User size={22} />
          <span>Profil</span>
        </Link>
      </div>
    </>
  );
}

export default BottomNav;
