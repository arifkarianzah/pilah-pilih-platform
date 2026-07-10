import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllPickups, acceptPickup } from "../services/pickupService";
import {
  Search, ClipboardList, RefreshCw, MapPin, Package,
  CheckCircle2, AlertTriangle, User, Scale, ChevronRight
} from "lucide-react";

/* ── Status tabs (logika tidak diubah) ── */
const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "accepted", label: "Diterima" },
  { key: "on_the_way", label: "Di Jalan" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Batal" },
];

const STATUS_CONFIG = {
  pending:          { label: "Menunggu",       badgeClass: "badge-pending",          dot: "#f59e0b" },
  accepted:         { label: "Diterima",        badgeClass: "badge-accepted",         dot: "#3b82f6" },
  on_the_way:       { label: "Di Jalan",        badgeClass: "badge-on_the_way",       dot: "#16a34a" },
  arrived:          { label: "Tiba",            badgeClass: "badge-arrived",          dot: "#8b5cf6" },
  collected:        { label: "Dijemput",        badgeClass: "badge-collected",        dot: "#ec4899" },
  waiting_collector:{ label: "Ke Pengepul",     badgeClass: "badge-waiting_collector",dot: "#0284c7" },
  weighing:         { label: "Ditimbang",       badgeClass: "badge-weighing",         dot: "#ea580c" },
  completed:        { label: "Selesai",         badgeClass: "badge-completed",        dot: "#10b981" },
  cancelled:        { label: "Dibatalkan",      badgeClass: "badge-cancelled",        dot: "#ef4444" },
};

const WASTE_EMOJI = {
  plastik: "♻️", kertas: "📄", logam: "🔩",
  kaca: "🔵", elektronik: "💻", organik: "🌿",
  besi: "⚙️", kardus: "📦", default: "🗑️"
};

function Orders() {
  const [pickups, setPickups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  /* ── Toast (logika tidak diubah) ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch (logika tidak diubah) ── */
  const fetchPickups = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllPickups();
      setPickups(res.data || []);
    } catch {
      setError("Gagal memuat order. Pastikan server berjalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPickups(); }, []);

  /* ── Filter (logika tidak diubah) ── */
  useEffect(() => {
    let data = pickups;
    if (activeTab !== "all") {
      data = data.filter(p => p.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.address?.toLowerCase().includes(q) ||
        p.waste_type?.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.user_name?.toLowerCase().includes(q) ||
        String(p.user_id).includes(q)
      );
    }
    setFiltered(data);
  }, [pickups, activeTab, search]);

  const countByStatus = (key) =>
    key === "all" ? pickups.length : pickups.filter(p => p.status === key).length;

  /* ── Accept order (logika tidak diubah) ── */
  const handleAccept = async (e, orderId) => {
    e.stopPropagation();
    setAccepting(orderId);
    try {
      await acceptPickup(orderId);
      showToast(`Order #${orderId} berhasil diterima!`);
      fetchPickups();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menerima order", "error");
    } finally {
      setAccepting(null);
    }
  };

  return (
    <>
      <Navbar
        title="Daftar Order"
        subtitle={`${pickups.length} total order`}
        onRefresh={fetchPickups}
        hideActions={false}
      />

      <div className="page-body">

        {/* ── Search Bar ── */}
        <div style={{
          background: "white", borderRadius: "var(--radius-xl)",
          padding: "0.85rem 1rem", marginBottom: "0.85rem",
          border: "1px solid rgba(0,0,0,0.05)", boxShadow: "var(--shadow-xs)"
        }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{
              position: "absolute", left: "0.85rem", top: "50%",
              transform: "translateY(-50%)", color: "var(--text-muted)"
            }} />
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama, alamat, jenis sampah..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: "2.5rem", width: "100%", borderRadius: "var(--radius-md)" }}
            />
          </div>
        </div>

        {/* ── Status Filter Tabs ── */}
        <div className="filter-tabs" style={{ marginBottom: "1rem" }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              className={`filter-tab${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{countByStatus(tab.key)}</span>
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: "var(--danger-light)", border: "1px solid #fecaca",
            color: "var(--danger)", borderRadius: "var(--radius-lg)",
            padding: "0.85rem 1rem", marginBottom: "0.85rem",
            fontWeight: 600, fontSize: "0.82rem",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {/* ── Order List ── */}
        {loading ? (
          <div className="empty-state" style={{ minHeight: 280 }}>
            <div className="spinner" />
            <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", fontWeight: 500 }}>Memuat order...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 280 }}>
            <div className="empty-state-icon">
              <ClipboardList size={28} />
            </div>
            <h3>Tidak Ada Order</h3>
            <p>
              {search
                ? `Tidak ada hasil untuk "${search}"`
                : "Belum ada order dengan status ini."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {filtered.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const wasteEmoji = WASTE_EMOJI[order.waste_type?.toLowerCase()] || WASTE_EMOJI.default;
              const statusKey = `status-${order.status}`;

              return (
                <div
                  key={order.id}
                  className={`order-list-card ${statusKey}`}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ paddingLeft: "1.25rem" }}
                >
                  {/* Waste Icon */}
                  <div style={{
                    width: 44, height: 44, background: "var(--primary-light)",
                    borderRadius: "var(--radius-md)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: "1.25rem"
                  }}>
                    {wasteEmoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Top row: ID + badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700 }}>
                        #{order.id}
                      </span>
                      <span className={`badge ${st.badgeClass}`}>{st.label}</span>
                    </div>

                    {/* User name */}
                    <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--text)", marginBottom: "0.25rem" }}>
                      <User size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                      {order.user_name || `User #${order.user_id}`}
                    </div>

                    {/* Address */}
                    <div style={{
                      fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 3
                    }}>
                      <MapPin size={11} style={{ flexShrink: 0 }} />
                      {order.address || "-"}
                    </div>

                    {/* Weight + type */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.35rem" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <Package size={11} />
                        {order.waste_type || "-"}
                      </span>
                      {order.estimated_weight && (
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                          <Scale size={11} />
                          ~{order.estimated_weight} kg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end", flexShrink: 0 }}>
                    {order.status === "pending" && (
                      <button
                        id={`btn-accept-${order.id}`}
                        className="btn btn-primary btn-sm"
                        onClick={(e) => handleAccept(e, order.id)}
                        disabled={accepting === order.id}
                        style={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                      >
                        {accepting === order.id ? (
                          <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        {accepting === order.id ? "..." : "Terima"}
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                      style={{ fontSize: "0.7rem", padding: "0.3rem 0.65rem" }}
                    >
                      Detail <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default Orders;
