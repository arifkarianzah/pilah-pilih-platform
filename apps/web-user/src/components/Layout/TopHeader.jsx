import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Moon, Search, Menu, X, ChevronDown, User } from "lucide-react";

function TopHeader({ user, notifications, unreadCount, onReadAll, onMenuOpen }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <header className="top-header">
      <div className="top-header-left">
        <button className="header-menu-btn" onClick={onMenuOpen}>
          <Menu size={22} />
        </button>
        <div className="header-greeting">
          <span className="header-greeting-text">{greeting()}, 👋</span>
          <span className="header-user-name">{user?.name || "Pengguna"}</span>
        </div>
      </div>

      <div className="top-header-right">
        {/* Notification Bell */}
        <div className="header-icon-wrap" style={{ position: "relative" }}>
          <button
            className="header-icon-btn"
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
          </button>

          {showNotif && (
            <div className="header-dropdown notif-dropdown">
              <div className="dropdown-header">
                <h4>Notifikasi</h4>
                {unreadCount > 0 && (
                  <button onClick={onReadAll} className="dropdown-action-link">Tandai semua dibaca</button>
                )}
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <p className="dropdown-empty">Belum ada notifikasi.</p>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`notif-item ${!n.is_read ? "unread" : ""}`}>
                      <div className="notif-dot" />
                      <div>
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-message">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Button */}
        <div className="header-icon-wrap" style={{ position: "relative" }}>
          <button
            className="header-profile-btn"
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
          >
            <div className="header-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="header-user-name-sm">{user?.name || "Pengguna"}</span>
            <ChevronDown size={14} />
          </button>

          {showProfile && (
            <div className="header-dropdown profile-dropdown">
              <Link to="/profile" className="dropdown-menu-item" onClick={() => setShowProfile(false)}>
                <User size={16} /> Profil Saya
              </Link>
              <div className="dropdown-divider" />
              <button
                className="dropdown-menu-item danger"
                onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
