import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getPickupById, acceptPickup, updatePickupStatus, weighPickup, completePickupTransaction
} from "../services/pickupService";
import {
  ArrowLeft, MapPin, Calendar, User,
  CheckCircle2, Truck, Clock, XCircle, Package,
  AlertTriangle, ChevronRight, Scale, MessageCircle, Navigation
} from "lucide-react";

/* ── Status config (label diperbaiki) ── */
const STATUS_CONFIG = {
  pending:          { label: "Menunggu",         color: "#d97706", bg: "#fffbeb",  icon: Clock },
  accepted:         { label: "Diterima",          color: "#2563eb", bg: "#eff6ff",  icon: CheckCircle2 },
  on_the_way:       { label: "Menuju Lokasi",     color: "#16a34a", bg: "#f0fdf4",  icon: Truck },
  arrived:          { label: "Tiba di Lokasi",    color: "#8b5cf6", bg: "#f5f3ff",  icon: MapPin },
  completed:        { label: "Selesai",            color: "#16a34a", bg: "#f0fdf4",  icon: CheckCircle2 },
  cancelled:        { label: "Dibatalkan",         color: "#ef4444", bg: "#fff1f2",  icon: XCircle },
};

/* ── Timeline — urutan baru sesuai permintaan user ── */
const TIMELINE = [
  { key: "pending",           label: "Order Masuk",     desc: "Permintaan penjemputan diterima" },
  { key: "accepted",          label: "Diterima",         desc: "Petugas mengkonfirmasi order" },
  { key: "on_the_way",        label: "Menuju Lokasi",   desc: "Petugas dalam perjalanan ke lokasi" },
  { key: "arrived",           label: "Tiba di Lokasi",  desc: "Petugas menimbang sampah & bayar" },
  { key: "completed",         label: "Selesai",          desc: "Transaksi selesai, saldo diperbarui" },
];

const statusOrder = TIMELINE.map(t => t.key);

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const [actualWeight, setActualWeight] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleTimbangDanSelesai = async () => {
    if (!actualWeight || Number(actualWeight) <= 0) {
      showToast("Masukkan berat aktual yang valid", "error");
      return;
    }
    setActionLoading(true);
    try {
      await weighPickup(id, [{ waste_type: order.waste_type, weight: Number(actualWeight) }]);
      await completePickupTransaction(id, paymentMethod);
      showToast("Order berhasil diselesaikan!");
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memproses order", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Toast (tidak diubah) ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch (tidak diubah) ── */
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await getPickupById(id);
      setOrder(res.data);
    } catch {
      setError("Gagal memuat detail order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  /* ── Handlers (semua logika tetap sama) ── */
  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptPickup(id);
      showToast("Order berhasil diterima!");
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menerima order", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setActionLoading(true);
    try {
      await updatePickupStatus(id, status);
      showToast(`Status: ${STATUS_CONFIG[status]?.label}`);
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleKirimPengepul = async () => {
    navigate(`/orders/${id}/send`);
  };

  const currentStatusIdx = statusOrder.indexOf(order?.status);
  const cfg = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending;

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <Navbar title="Detail Order" hideActions={true} showBack={true} />
        <div className="page-body">
          <div className="empty-state" style={{ minHeight: 360 }}>
            <div className="spinner" />
            <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", fontWeight: 500 }}>Memuat detail...</p>
          </div>
        </div>
      </>
    );
  }

  /* ── Error state ── */
  if (error || !order) {
    return (
      <>
        <Navbar title="Detail Order" hideActions={true} showBack={true} />
        <div className="page-body">
          <div className="empty-state" style={{ minHeight: 360 }}>
            <div className="empty-state-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>Order Tidak Ditemukan</h3>
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/orders")} style={{ marginTop: "1rem" }}>
              Kembali ke Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  const StatusIcon = cfg.icon;

  return (
    <>
      <Navbar title={`Order #${order.id}`} hideActions={true} showBack={true} />

      <div className="page-body">

        {/* ── STATUS BANNER ── */}
        <div style={{
          background: `linear-gradient(135deg, ${cfg.color}15, ${cfg.color}08)`,
          border: `1.5px solid ${cfg.color}30`,
          borderRadius: "var(--radius-xl)", padding: "1.15rem",
          display: "flex", alignItems: "center", gap: "1rem",
          marginBottom: "1rem"
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "var(--radius-lg)",
            background: `${cfg.color}18`, display: "flex",
            alignItems: "center", justifyContent: "center", color: cfg.color
          }}>
            <StatusIcon size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>
              Status Saat Ini
            </p>
            <h2 style={{ color: cfg.color, fontWeight: 900, fontSize: "1.2rem", letterSpacing: -0.5, margin: 0 }}>
              {cfg.label}
            </h2>
          </div>
          <span className={`badge badge-${order.status}`}>{cfg.label}</span>
        </div>

        <div className="detail-grid">

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

            {/* Order Info Card */}
            <div className="card" style={{ padding: "1.15rem" }}>
              <div className="card-header">
                <span className="card-title">Informasi Order</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>#{order.id}</span>
              </div>

              <div className="info-row">
                <div className="info-label"><User size={13} /> Pengguna</div>
                <div className="info-value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {order.user_name || `#${order.user_id}`}
                  <button
                    onClick={() => navigate(`/chat?userId=${order.user_id}`)}
                    style={{
                      background: "var(--brand)", color: "white", border: "none",
                      borderRadius: "50%", width: 24, height: 24,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                    }}
                    aria-label="Chat dengan user"
                  >
                    <MessageCircle size={12} />
                  </button>
                </div>
              </div>

              <div className="info-row">
                <div className="info-label"><Package size={13} /> Jenis Sampah</div>
                <div className="info-value" style={{ textTransform: "capitalize" }}>{order.waste_type || "-"}</div>
              </div>

              <div className="info-row">
                <div className="info-label"><Scale size={13} /> Berat Estimasi</div>
                <div className="info-value">{order.estimated_weight ? `${order.estimated_weight} kg` : "-"}</div>
              </div>

              <div className="info-row">
                <div className="info-label"><Scale size={13} /> Berat Aktual</div>
                <div className="info-value" style={{ color: order.actual_weight ? "var(--brand)" : "var(--text-muted)" }}>
                  {order.actual_weight ? `${order.actual_weight} kg` : "Belum ditimbang"}
                </div>
              </div>

              <div className="info-row">
                <div className="info-label"><MapPin size={13} /> Alamat</div>
                <div className="info-value" style={{ maxWidth: 200, textAlign: "right", lineHeight: 1.5 }}>{order.address || "-"}</div>
              </div>

              {order.address && (
                <div style={{ marginTop: "0.75rem" }}>
                  <button
                    className="btn btn-ghost btn-sm btn-full"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`, "_blank")}
                  >
                    <Navigation size={13} /> Buka di Maps
                  </button>
                </div>
              )}

              <div className="info-row">
                <div className="info-label"><Calendar size={13} /> Tanggal</div>
                <div className="info-value">
                  {order.pickup_date
                    ? new Date(order.pickup_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    : new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>

            {/* ── ACTION BUTTONS (logika 100% sama) ── */}
            {order.status !== "completed" && order.status !== "cancelled" && (
              <div className="card" style={{ padding: "1.15rem" }}>
                <div className="card-title" style={{ marginBottom: "1rem" }}>Tindakan</div>

                {order.status === "pending" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    <div style={{
                      background: "var(--warning-light)", borderRadius: "var(--radius-md)",
                      padding: "0.75rem", fontSize: "0.78rem", color: "#92400e", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: "0.5rem"
                    }}>
                      <AlertTriangle size={14} />
                      Order menunggu konfirmasi Anda.
                    </div>
                    <button id="btn-accept" className="btn btn-primary btn-lg btn-full" onClick={handleAccept} disabled={actionLoading}>
                      <CheckCircle2 size={18} />
                      {actionLoading ? "Memproses..." : "Terima Order"}
                    </button>
                  </div>
                )}

                {order.status === "accepted" && (
                  <button id="btn-on-way" className="btn btn-success btn-lg btn-full" onClick={() => handleUpdateStatus("on_the_way")} disabled={actionLoading}>
                    <Truck size={18} />
                    {actionLoading ? "Memproses..." : "Mulai Menuju Lokasi"}
                  </button>
                )}

                {order.status === "on_the_way" && (
                  <button className="btn btn-warning btn-lg btn-full" onClick={() => handleUpdateStatus("arrived")} disabled={actionLoading}>
                    <MapPin size={18} />
                    {actionLoading ? "Memproses..." : "Tiba di Lokasi"}
                  </button>
                )}

                {["arrived", "collected", "waiting_collector", "weighing"].includes(order.status) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", background: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>Timbang & Bayar Langsung</div>
                    
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "4px", display: "block" }}>Berat Aktual (KG)</label>
                      <input 
                        type="number" 
                        className="input" 
                        placeholder="Contoh: 5.5" 
                        value={actualWeight} 
                        onChange={e => setActualWeight(e.target.value)} 
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "4px", display: "block" }}>Metode Pencairan</label>
                      <select 
                        className="input" 
                        value={paymentMethod} 
                        onChange={e => setPaymentMethod(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white" }}
                      >
                        <option value="cash">Tunai (Bayar Langsung)</option>
                        <option value="saldo">Saldo Dompet Digital</option>
                      </select>
                    </div>

                    <button className="btn btn-primary btn-lg btn-full" onClick={handleTimbangDanSelesai} disabled={actionLoading} style={{ marginTop: "0.5rem" }}>
                      <Scale size={18} />
                      {actionLoading ? "Memproses..." : "Timbang & Selesaikan"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Completed Banner */}
            {order.status === "completed" && (
              <div style={{
                background: "linear-gradient(135deg, var(--brand-darker), var(--brand))",
                borderRadius: "var(--radius-xl)", padding: "1.25rem",
                color: "white", display: "flex", alignItems: "center", gap: "1rem"
              }}>
                <div style={{
                  width: 48, height: 48, background: "rgba(255,255,255,0.15)",
                  borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontWeight: 800 }}>Penjemputan Selesai! 🎉</h3>
                  <p style={{ fontSize: "0.78rem", opacity: 0.75, margin: 0 }}>
                    Berat aktual: {order.actual_weight || "-"} kg · Saldo pengguna telah diperbarui.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: TIMELINE ── */}
          <div>
            <div className="card" style={{ padding: "1.15rem" }}>
              <div className="card-title" style={{ marginBottom: "1.25rem" }}>Alur Status</div>
              <div className="timeline">
                {TIMELINE.map((step) => {
                  const stepIdx = statusOrder.indexOf(step.key);
                  const isDone = currentStatusIdx > stepIdx;
                  const isActive = currentStatusIdx === stepIdx;
                  return (
                    <div
                      key={step.key}
                      className={`timeline-item${isDone ? " is-done" : ""}${isActive ? " is-active" : ""}`}
                    >
                      <div className={`timeline-dot${isDone ? " is-done" : ""}${isActive ? " is-active" : ""}`}>
                        {isDone && <CheckCircle2 size={13} />}
                        {isActive && <ChevronRight size={13} />}
                      </div>
                      <div className="timeline-content">
                        <h4 style={{
                          color: isDone ? "var(--text-muted)" : isActive ? "var(--brand)" : "var(--text-light)",
                          textDecoration: isDone ? "line-through" : "none"
                        }}>
                          {step.label}
                        </h4>
                        <p style={{ color: isDone || isActive ? "var(--text-muted)" : "var(--text-light)" }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
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

export default OrderDetail;
