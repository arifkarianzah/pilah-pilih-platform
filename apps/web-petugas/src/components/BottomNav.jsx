import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Package, QrCode, ClipboardList, User, MessageCircle } from "lucide-react";
import api from "../services/api";

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("/pickups/petugas/all");
        // axios res.data gives the JSON object. The array is in res.data.data
        const pickupsArray = res.data.data || [];
        const activeOrders = pickupsArray.filter(
          p => p.status === "pending" || p.status === "accepted" || p.status === "on_the_way"
        );
        setActiveCount(activeOrders.length);
      } catch (err) {
        console.error("Error fetching active orders count", err);
      }
    };

    fetchActiveOrders();
    
    // Polling setiap 15 detik agar tetap up-to-date
    const interval = setInterval(fetchActiveOrders, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Update juga ketika pindah halaman

  return (
    <div className="bottom-nav">
      <Link to="/dashboard" className={`nav-item ${path === "/dashboard" ? "active" : ""}`}>
        <Home size={22} />
        <span>Beranda</span>
      </Link>
      
      <Link to="/orders" className={`nav-item ${path.startsWith("/orders") ? "active" : ""}`} style={{ position: "relative" }}>
        <Package size={22} />
        {activeCount > 0 && (
          <div className="nav-badge" style={{ position: "absolute", top: 0, right: "20%", background: "var(--danger)", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "bold" }}>
            {activeCount}
          </div>
        )}
        <span>Order</span>
      </Link>

      <div className="nav-item-center">
        <Link to="/timbang" className="fab-button">
          <QrCode size={26} />
        </Link>
      </div>

      <Link to="/riwayat" className={`nav-item ${path === "/riwayat" ? "active" : ""}`}>
        <ClipboardList size={22} />
        <span>Riwayat</span>
      </Link>

      <Link to="/profil" className={`nav-item ${path === "/profil" ? "active" : ""}`}>
        <User size={22} />
        <span>Profil</span>
      </Link>
    </div>
  );
}

export default BottomNav;
