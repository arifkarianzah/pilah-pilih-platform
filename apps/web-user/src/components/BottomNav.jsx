import { Link, useLocation } from "react-router-dom";
import { Home, Recycle, ScanLine, Gift, User } from "lucide-react";

function BottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
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

      <Link to="/profile" className={`nav-item ${isActive("/profile")}`}>
        <User size={22} />
        <span>Profil</span>
      </Link>
    </div>
  );
}

export default BottomNav;
