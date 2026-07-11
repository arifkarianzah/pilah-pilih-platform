import React, { useState, useEffect, Fragment } from "react";
import Navbar from "../components/Navbar";
import { getAllPickups, weighPickup } from "../services/pickupService";
import {
  History, CheckCircle2, XCircle, Clock, Filter, Download,
  MapPin, Calendar, Weight, ChevronDown, ChevronUp
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Menunggu", className: "badge-pending" },
  accepted: { label: "Diterima", className: "badge-accepted" },
  on_the_way: { label: "Di Jalan", className: "badge-on_the_way" },
  completed: { label: "Selesai", className: "badge-completed" },
  cancelled: { label: "Dibatalkan", className: "badge-cancelled" },
};

function Riwayat() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [weights, setWeights] = useState({});
  const [processing, setProcessing] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await getAllPickups();
      setPickups(res.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleComplete = async (orderId) => {
    const weight = weights[orderId];
    if (!weight) return alert("Masukkan berat aktual (kg) terlebih dahulu!");
    
    setProcessing(orderId);
    try {
      await weighPickup(orderId, weight);
      await completePickup(orderId);
      alert("Order berhasil diselesaikan!");
      fetchAll();
      setExpanded(null);
    } catch (err) {
      alert("Gagal menyelesaikan order: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(null);
    }
  };

  const filtered = pickups
    .filter(p => filter === "all" || p.status === filter)
    .sort((a, b) => sortDesc
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at)
    );

  const completedCount = pickups.filter(p => p.status === "completed").length;
  const totalWeight = pickups
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + (parseFloat(p.actual_weight) || 0), 0);

  return (
    <>
      <Navbar
        title="Riwayat Penjemputan"
        subtitle="Histori semua order yang pernah ditangani"
        hideActions={true}
      />

      <div className="page-body">

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 36, height: 36, background: "var(--success-light)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>Total Selesai</p>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--brand)", lineHeight: 1, margin: "4px 0 0 0" }}>{completedCount}</h3>
            </div>
          </div>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 36, height: 36, background: "var(--info-light)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
              <Weight size={18} />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>Total Berat</p>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2563eb", lineHeight: 1, margin: "4px 0 0 0" }}>{totalWeight.toFixed(1)} <span style={{ fontSize: "0.8rem" }}>kg</span></h3>
            </div>
          </div>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 36, height: 36, background: "var(--warning-light)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
              <History size={18} />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>Total Order</p>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#d97706", lineHeight: 1, margin: "4px 0 0 0" }}>{pickups.length}</h3>
            </div>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="card" style={{ marginBottom: "1.25rem", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={14} color="var(--text-muted)" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Filter:</span>
            </div>
            {Object.entries({ all: "Semua", completed: "Selesai", cancelled: "Dibatalkan", pending: "Menunggu" }).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "20px",
                  border: filter === key ? "none" : "1px solid var(--border)",
                  background: filter === key ? "var(--brand)" : "transparent",
                  color: filter === key ? "white" : "var(--text-muted)",
                  fontWeight: 700, fontSize: "0.7rem", cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setSortDesc(!sortDesc)}
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}
            >
              {sortDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              {sortDesc ? "Terbaru" : "Terlama"}
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-state card" style={{ minHeight: 250, padding: '2rem', border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div className="spinner" style={{ width: 24, height: 24 }} />
            <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>Memuat riwayat...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card" style={{ minHeight: 250, padding: '2rem', border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
              <History size={24} color="#94a3b8" />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>Belum Ada Riwayat</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Riwayat penjemputan akan muncul di sini.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Jenis Sampah</th>
                    <th>Alamat</th>
                    <th>Est. (kg)</th>
                    <th>Aktual (kg)</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const isExp = expanded === order.id;
                    return (
                      <Fragment key={order.id}>
                        <tr style={{ cursor: "pointer" }} onClick={() => setExpanded(isExp ? null : order.id)}>
                          <td><strong>#{order.id}</strong></td>
                          <td>User #{order.user_id}</td>
                          <td style={{ textTransform: "capitalize" }}>{order.waste_type || "-"}</td>
                          <td style={{ maxWidth: 160 }}>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {order.address || "-"}
                            </div>
                          </td>
                          <td>{order.estimated_weight || "-"}</td>
                          <td style={{ color: order.actual_weight ? "var(--brand)" : "var(--text-light)", fontWeight: order.actual_weight ? 700 : 400 }}>
                            {order.actual_weight || "-"}
                          </td>
                          <td>
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric", month: "short", year: "numeric"
                                })
                              : "-"}
                          </td>
                          <td>
                            <span className={`badge ${st.className}`}>{st.label}</span>
                          </td>
                          <td>
                            {isExp ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                          </td>
                        </tr>
                        {isExp && (
                          <tr key={`${order.id}-detail`}>
                            <td colSpan={9} style={{ background: "var(--surface-2)", padding: "1rem 1.25rem" }}>
                              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                                <div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>ALAMAT LENGKAP</div>
                                  <div style={{ marginTop: 4, fontSize: "0.88rem", fontWeight: 600 }}>{order.address}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>TANGGAL PICKUP</div>
                                  <div style={{ marginTop: 4, fontSize: "0.88rem", fontWeight: 600 }}>
                                    {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>PETUGAS ID</div>
                                  <div style={{ marginTop: 4, fontSize: "0.88rem", fontWeight: 600 }}>{order.petugas_id ? `#${order.petugas_id}` : "-"}</div>
                                </div>
                              </div>
                              
                              {order.status === "on_the_way" && (
                                <div style={{ marginTop: "1rem", background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                  <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "4px" }}>Sedang Dalam Perjalanan</div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Silakan proses (kirim ke pengepul) pesanan ini melalui halaman "Order" utama.</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid var(--border)", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Menampilkan {filtered.length} dari {pickups.length} order
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Riwayat;
