import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Recycle, ScanLine, Gift, Menu } from "lucide-react";
import Sidebar from "./Layout/Sidebar";

function BottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "active" : "";
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <ScanLine size={28} />
          </Link>
        </div>

        <Link to="/reward" className={`nav-item ${isActive("/reward")}`}>
          <Gift size={22} />
          <span>Reward</span>
        </Link>

        <button className="nav-item" onClick={() => setSidebarOpen(true)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0" }}>
          <Menu size={22} />
          <span>Menu</span>
        </button>
      </div>
    </>
  );
}

export default BottomNav;
