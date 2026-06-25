import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getPickupById, acceptPickup, updatePickupStatus, completePickup
} from "../services/pickupService";
import {
  ArrowLeft, MapPin, Calendar, Weight, User,
  CheckCircle2, Truck, Clock, XCircle, Package,
  AlertTriangle, ChevronRight, Scale, MessageCircle
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Menunggu", color: "#d97706", bg: "var(--warning-light)", icon: Clock },
  accepted: { label: "Diterima", color: "#2563eb", bg: "var(--info-light)", icon: CheckCircle2 },
  on_the_way: { label: "Di Perjalanan", color: "#059669", bg: "#f0fdf4", icon: Truck },
  arrived: { label: "Tiba di Lokasi", color: "#8b5cf6", bg: "#f3e8ff", icon: MapPin },
  collected: { label: "Sampah Dijemput", color: "#ec4899", bg: "#fce7f3", icon: Package },
  waiting_collector: { label: "Menunggu Pengepul", color: "#0284c7", bg: "#e0f2fe", icon: Scale },
  weighing: { label: "Sedang Ditimbang", color: "#ea580c", bg: "#ffedd5", icon: Scale },
  completed: { label: "Selesai", color: "var(--brand)", bg: "var(--success-light)", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "var(--danger)", bg: "var(--danger-light)", icon: XCircle },
};

const TIMELINE = [
  { key: "pending", label: "Order Masuk", desc: "Permintaan diterima" },
  { key: "accepted", label: "Diterima Petugas", desc: "Petugas mengkonfirmasi" },
  { key: "on_the_way", label: "Dalam Perjalanan", desc: "Petugas menuju lokasi" },
  { key: "arrived", label: "Tiba di Lokasi", desc: "Petugas telah sampai" },
  { key: "collected", label: "Sampah Dijemput", desc: "Sampah telah diangkut" },
  { key: "waiting_collector", label: "Dikirim ke Pengepul", desc: "Menunggu pengepul menerima" },
  { key: "weighing", label: "Sedang Ditimbang", desc: "Pengepul menimbang sampah" },
  { key: "completed", label: "Selesai", desc: "Transaksi selesai" },
];

const statusOrder = ["pending", "accepted", "on_the_way", "arrived", "collected", "waiting_collector", "weighing", "completed"];

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const [confirmComplete, setConfirmComplete] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast(`Status diperbarui: ${STATUS_CONFIG[status]?.label}`);
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleKirimPengepul = async () => {
    // Navigate to a form where Petugas selects Pengepul and uploads photo, but for now we can just navigate to a send page or update directly if we have pengepul_id.
    // Actually, Petugas needs to select a Pengepul. So we redirect them to a page to select pengepul.
    navigate(`/orders/${id}/send`);
  };

  const currentStatusIdx = statusOrder.indexOf(order?.status);
  const cfg = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending;

  if (loading) {
    return (
      <>
        <Navbar title="Detail Order" hideActions={true} />
        <div className="page-body">
          <div className="empty-state" style={{ minHeight: 400 }}>
            <div className="spinner" />
            <p>Memuat detail...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar title="Detail Order" hideActions={true} />
        <div className="page-body">
          <div className="empty-state" style={{ minHeight: 400 }}>
            <div className="empty-state-icon"><AlertTriangle size={32} /></div>
            <h3>Order Tidak Ditemukan</h3>
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/orders")}>
              Kembali ke Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title={`Order #${order.id}`} subtitle="Detail & tindakan penjemputan" hideActions={true} />

      <div className="page-body">
        {/* Back Button */}
        <button
          onClick={() => navigate("/orders")}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: "1.5rem" }}
        >
          <ArrowLeft size={14} /> Kembali
        </button>

        <div className="detail-grid">
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Status Banner */}
            <div style={{
              background: cfg.bg, border: `1px solid ${cfg.color}30`,
              borderRadius: "var(--radius-xl)", padding: "1.25rem 1.5rem",
              display: "flex", alignItems: "center", gap: "1rem"
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "var(--radius-lg)",
                background: cfg.color + "20", display: "flex",
                alignItems: "center", justifyContent: "center", color: cfg.color
              }}>
                <cfg.icon size={26} />
              </div>
              <div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>
                  Status Saat Ini
                </p>
                <h2 style={{ color: cfg.color, fontWeight: 900, fontSize: "1.4rem", letterSpacing: -0.5 }}>
                  {cfg.label}
                </h2>
              </div>
              <span className={`badge badge-${order.status}`} style={{ marginLeft: "auto" }}>
                {cfg.label}
              </span>
            </div>

            {/* Order Info */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Informasi Order</div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>#{order.id}</span>
              </div>

              <div className="info-row">
                <div className="info-label"><User size={14} style={{ verticalAlign: -2, marginRight: 4 }} />User ID</div>
                <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  #{order.user_id}
                  <button onClick={() => navigate(`/chat?userId=${order.user_id}`)} style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <MessageCircle size={14} />
                  </button>
                </div>
              </div>
              <div className="info-row">
                <div className="info-label"><Package size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Jenis Sampah</div>
                <div className="info-value" style={{ textTransform: "capitalize" }}>{order.waste_type || "-"}</div>
              </div>
              <div className="info-row">
                <div className="info-label"><Weight size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Berat Estimasi</div>
                <div className="info-value">{order.estimated_weight ? `${order.estimated_weight} kg` : "-"}</div>
              </div>
              <div className="info-row">
                <div className="info-label"><Scale size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Berat Aktual</div>
                <div className="info-value" style={{ color: order.actual_weight ? "var(--brand)" : "var(--text-muted)" }}>
                  {order.actual_weight ? `${order.actual_weight} kg` : "Belum ditimbang"}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label"><MapPin size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Alamat</div>
                <div className="info-value" style={{ maxWidth: 260, textAlign: "right" }}>{order.address || "-"}</div>
              </div>
              <div className="info-row">
                <div className="info-label"><Calendar size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Tanggal Pickup</div>
                <div className="info-value">
                  {order.pickup_date
                    ? new Date(order.pickup_date).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })
                    : "-"}
                </div>
              </div>
              {order.petugas_id && (
                <div className="info-row">
                  <div className="info-label">Petugas ID</div>
                  <div className="info-value">#{order.petugas_id}</div>
                </div>
              )}
              <div className="info-row">
                <div className="info-label">Dibuat</div>
                <div className="info-value">
                  {new Date(order.created_at).toLocaleString("id-ID", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {order.status !== "completed" && order.status !== "cancelled" && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: "1rem" }}>Tindakan</div>

                {order.status === "pending" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{
                      background: "var(--warning-light)", borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem", fontSize: "0.85rem",
                      color: "#92400e", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: "0.5rem"
                    }}>
                      <AlertTriangle size={16} />
                      Order ini menunggu konfirmasi. Terima untuk mulai proses penjemputan.
                    </div>
                    <button
                      id="btn-accept"
                      className="btn btn-primary btn-lg btn-full"
                      onClick={handleAccept}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 size={18} />
                      {actionLoading ? "Memproses..." : "Terima Order"}
                    </button>
                  </div>
                )}

                {order.status === "accepted" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                      id="btn-on-way"
                      className="btn btn-success btn-lg btn-full"
                      onClick={() => handleUpdateStatus("on_the_way")}
                      disabled={actionLoading}
                    >
                      <Truck size={18} />
                      {actionLoading ? "Memproses..." : "Mulai Perjalanan"}
                    </button>
                  </div>
                )}

                {order.status === "on_the_way" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                      className="btn btn-warning btn-lg btn-full"
                      onClick={() => handleUpdateStatus("arrived")}
                      disabled={actionLoading}
                    >
                      <MapPin size={18} />
                      Tiba di Lokasi
                    </button>
                  </div>
                )}

                {order.status === "arrived" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                      className="btn btn-primary btn-lg btn-full"
                      onClick={() => handleUpdateStatus("collected")}
                      disabled={actionLoading}
                    >
                      <Package size={18} />
                      Selesai Muat Sampah
                    </button>
                  </div>
                )}

                {order.status === "collected" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{
                      background: "var(--info-light)", borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem", fontSize: "0.85rem",
                      color: "#1e40af", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: "0.5rem"
                    }}>
                      <Truck size={16} />
                      Bawa sampah ke pengepul terdekat untuk ditimbang.
                    </div>
                    <button
                      className="btn btn-success btn-lg btn-full"
                      onClick={handleKirimPengepul}
                      disabled={actionLoading}
                    >
                      <Scale size={18} />
                      Kirim ke Pengepul
                    </button>
                  </div>
                )}
                
                {["waiting_collector", "weighing"].includes(order.status) && (
                   <div style={{
                      background: "var(--warning-light)", borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem", fontSize: "0.85rem",
                      color: "#92400e", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: "0.5rem"
                    }}>
                      <Clock size={16} />
                      Menunggu pengepul menyelesaikan penimbangan dan konfirmasi.
                    </div>
                )}
              </div>
            )}

            {order.status === "completed" && (
              <div style={{
                background: "linear-gradient(135deg, var(--brand), var(--brand-light))",
                borderRadius: "var(--radius-xl)", padding: "1.5rem", color: "white",
                display: "flex", alignItems: "center", gap: "1rem"
              }}>
                <div style={{
                  width: 52, height: 52, background: "rgba(255,255,255,0.15)",
                  borderRadius: "var(--radius-lg)", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 style={{ marginBottom: 4 }}>Penjemputan Selesai!</h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem" }}>
                    Berat aktual: {order.actual_weight || "-"} kg · Saldo pengguna telah diperbarui.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: "1.5rem" }}>Alur Status</div>
              <div className="timeline">
                {TIMELINE.map((step, idx) => {
                  const stepIdx = statusOrder.indexOf(step.key);
                  const isDone = currentStatusIdx > stepIdx;
                  const isActive = currentStatusIdx === stepIdx;
                  return (
                    <div
                      key={step.key}
                      className={`timeline-item${isDone ? " active" : ""}`}
                    >
                      <div className={`timeline-dot${isDone ? " done" : isActive ? " active" : ""}`}>
                        {isDone && <CheckCircle2 size={14} />}
                        {isActive && <ChevronRight size={14} />}
                      </div>
                      <div className="timeline-content">
                        <h4 style={{ color: isDone || isActive ? "var(--text)" : "var(--text-muted)" }}>
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

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default OrderDetail;
