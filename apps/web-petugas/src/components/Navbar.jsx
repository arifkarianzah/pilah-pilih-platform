import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ title, subtitle, onRefresh, hideActions, showBack }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "1.5px solid var(--border)", background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-muted)",
            flexShrink: 0, transition: "all 0.2s"
          }}
          aria-label="Kembali"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {!hideActions && onRefresh && (
        <div className="topbar-actions">
          <button
            className="topbar-btn"
            onClick={onRefresh}
            title="Refresh"
            aria-label="Refresh halaman"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
