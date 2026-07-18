import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Package, Scale, ClipboardList, User } from "lucide-react";
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
    const interval = setInterval(fetchActiveOrders, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Beranda", exact: true },
    { to: "/orders", icon: Package, label: "Order", badge: activeCount, prefix: "/orders" },
    null, // Center FAB placeholder
    { to: "/riwayat", icon: ClipboardList, label: "Riwayat" },
    { to: "/profil", icon: User, label: "Profil" },
  ];

  const isActive = (item) => {
    if (!item) return false;
    if (item.exact) return path === item.to;
    if (item.prefix) return path.startsWith(item.prefix);
    return path === item.to;
  };

  return (
    <div className="bottom-nav">
      {navItems.map((item, idx) => {
        if (item === null) {
          return (
            <div key="fab" className="nav-item-center">
              <Link to="/timbang" className="fab-button" aria-label="Timbang">
                <Scale size={24} />
              </Link>
            </div>
          );
        }
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item${active ? " active" : ""}`}
            aria-label={item.label}
          >
            <div style={{ position: "relative" }}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {item.badge > 0 && (
                <div className="nav-badge">{item.badge > 9 ? "9+" : item.badge}</div>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default BottomNav;
