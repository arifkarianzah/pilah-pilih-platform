import React, { useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ title, subtitle, onRefresh, hideActions }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [isOnline, setIsOnline] = useState(true);

  // Extract initials for avatar
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "P";

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {!hideActions && (
        <div className="topbar-actions">
        {onRefresh && (
          <button className="topbar-btn" onClick={onRefresh} title="Refresh">
            <RefreshCw size={18} />
          </button>
        )}

        <button 
          type="button"
          className="topbar-status" 
          onClick={() => setIsOnline(!isOnline)}
          style={{ 
            cursor: "pointer", 
            background: isOnline ? "#dcfce7" : "#f1f5f9",
            color: isOnline ? "#166534" : "#64748b",
            border: isOnline ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
            transition: "all 0.2s"
          }}
        >
          <div className="status-dot" style={{ background: isOnline ? "#10b981" : "#94a3b8" }} />
          {isOnline ? "Online" : "Offline"}
        </button>

        <button 
          type="button"
          className="topbar-btn" 
          title="Notifikasi" 
          style={{ position: "relative", cursor: "pointer" }}
          onClick={() => alert("Tidak ada notifikasi baru saat ini.")}
        >
          <Bell size={20} />
          <span style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            background: "#ef4444",
            color: "white",
            fontSize: "10px",
            fontWeight: "bold",
            borderRadius: "50%",
            width: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white"
          }}>
            3
          </span>
        </button>

        <div style={{ position: "relative" }}>
          <button 
            type="button"
            onClick={() => {
              const menu = document.getElementById("profile-menu");
              if (menu) menu.style.display = menu.style.display === "none" ? "block" : "none";
            }}
            style={{
              width: "36px",
              height: "36px",
              background: "var(--brand)",
              color: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
              border: "2px solid #e2f5ec",
              padding: 0
            }}
            title="Menu Profil"
          >
            {initials}
          </button>
          
          <div id="profile-menu" style={{
            display: "none",
            position: "absolute",
            top: "45px",
            right: "0",
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            padding: "8px 0",
            minWidth: "150px",
            zIndex: 1000,
            border: "1px solid #e2e8f0"
          }}>
            <button 
              type="button"
              onClick={() => navigate("/profil")}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--text-color)" }}
              onMouseOver={(e) => e.target.style.background = "#f1f5f9"}
              onMouseOut={(e) => e.target.style.background = "none"}
            >
              Profil Saya
            </button>
            <button 
              type="button"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#ef4444", fontWeight: "bold" }}
              onMouseOver={(e) => e.target.style.background = "#fef2f2"}
              onMouseOut={(e) => e.target.style.background = "none"}
            >
              Logout
            </button>
          </div>
        </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
