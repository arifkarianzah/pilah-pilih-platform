import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllPickups, acceptPickup } from "../services/pickupService";
import {
  Search, ClipboardList, RefreshCw, MapPin, Package,
  CheckCircle2, AlertTriangle, User, Weight
} from "lucide-react";

const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "accepted", label: "Diterima" },
  { key: "on_the_way", label: "Di Jalan" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
];

const STATUS_CONFIG = {
  pending: { label: "Menunggu", badgeClass: "badge-pending" },
  accepted: { label: "Diterima", badgeClass: "badge-accepted" },
  on_the_way: { label: "Di Jalan", badgeClass: "badge-on_the_way" },
  completed: { label: "Selesai", badgeClass: "badge-completed" },
  cancelled: { label: "Dibatalkan", badgeClass: "badge-cancelled" },
};

const WASTE_ICONS = {
  kertas: "📄", plastik: "♻️", logam: "🔩",
  kaca: "🔵", elektronik: "💻", organik: "🌿",
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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

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
        title="Order Masuk"
        subtitle={`${pickups.length} total order terdaftar`}
        onRefresh={fetchPickups}
        hideActions={true}
      />

      <div className="page-body">
        {/* Search & Filter Bar */}
        <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={16} style={{
                position: "absolute", left: "0.9rem", top: "50%",
                transform: "translateY(-50%)", color: "var(--text-muted)"
              }} />
              <input
                type="text"
                className="form-input"
                placeholder="Cari nama, alamat, jenis sampah, atau ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: "2.5rem", width: "100%" }}
              />
            </div>
            <button
              onClick={fetchPickups}
              className="btn btn-ghost btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-full)",
                border: activeTab === tab.key ? "none" : "1.5px solid var(--border)",
                background: activeTab === tab.key ? "var(--brand)" : "white",
                color: activeTab === tab.key ? "white" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              {tab.label}
              <span style={{
                background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : "var(--surface-2)",
                color: activeTab === tab.key ? "white" : "var(--text-muted)",
                borderRadius: "var(--radius-full)",
                padding: "1px 8px",
                fontSize: "0.72rem",
                fontWeight: 800
              }}>
                {countByStatus(tab.key)}
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "var(--danger-light)", border: "1px solid #fecaca",
            color: "var(--danger)", borderRadius: "var(--radius-lg)",
            padding: "1rem 1.25rem", marginBottom: "1rem", fontWeight: 600, fontSize: "0.88rem"
          }}>
            {error}
          </div>
        )}

        {/* Order Grid / List */}
        {loading ? (
          <div className="empty-state" style={{ minHeight: 300 }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p>Memuat order...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 300 }}>
            <div className="empty-state-icon"><ClipboardList size={32} /></div>
            <h3>Tidak Ada Order</h3>
            <p>
              {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada order dengan status ini."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {filtered.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const wasteIcon = WASTE_ICONS[order.waste_type?.toLowerCase()] || "🗑️";
              return (
                <div
                  key={order.id}
                  className="order-list-card"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  {/* Left: Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        #{order.id}
                      </span>
                      <span className={`badge ${st.badgeClass}`}>{st.label}</span>
                    </div>

                    <div className="grid-3-res">
                      {/* Nama User */}
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                          <User size={11} style={{ verticalAlign: -1, marginRight: 3 }} />Nama User
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                          {order.user_name || `User #${order.user_id}`}
                        </div>
                      </div>

                      {/* Alamat */}
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                          <MapPin size={11} style={{ verticalAlign: -1, marginRight: 3 }} />Alamat
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {order.address || "-"}
                        </div>
                      </div>

                      {/* Sampah & Berat */}
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                          <Package size={11} style={{ verticalAlign: -1, marginRight: 3 }} />Sampah
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", textTransform: "capitalize" }}>
                          {wasteIcon} {order.waste_type || "-"}
                        </div>
                        {order.estimated_weight && (
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                            <Weight size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                            Est. {order.estimated_weight} Kg
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end", flexShrink: 0 }}>
                    {order.status === "pending" && (
                      <button
                        id={`btn-accept-${order.id}`}
                        className="btn btn-primary btn-sm"
                        onClick={(e) => handleAccept(e, order.id)}
                        disabled={accepting === order.id}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <CheckCircle2 size={14} />
                        {accepting === order.id ? "Memproses..." : "Terima Order"}
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                      style={{ fontSize: "0.78rem" }}
                    >
                      Lihat Detail →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default Orders;
