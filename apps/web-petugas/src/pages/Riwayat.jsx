import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getAllPickups } from "../services/pickupService";
import {
  History, CheckCircle2, XCircle, Clock, Filter,
  MapPin, Calendar, Package, ChevronDown, ChevronUp,
  Truck, Scale, TrendingUp, Award
} from "lucide-react";

const STATUS_CONFIG = {
  pending:    { label: "Menunggu",      color: "#d97706", bg: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "#fcd34d", icon: Clock },
  accepted:   { label: "Diterima",      color: "#2563eb", bg: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "#93c5fd", icon: CheckCircle2 },
  on_the_way: { label: "Di Jalan",      color: "#16a34a", bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "#86efac", icon: Truck },
  arrived:    { label: "Tiba",          color: "#7c3aed", bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "#c4b5fd", icon: MapPin },
  completed:  { label: "Selesai",       color: "#059669", bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "#6ee7b7", icon: CheckCircle2 },
  cancelled:  { label: "Dibatalkan",    color: "#dc2626", bg: "linear-gradient(135deg, #fff1f2, #ffe4e6)", border: "#fca5a5", icon: XCircle },
};

const WASTE_EMOJI = {
  plastik: "♻️", kertas: "📄", logam: "🔩",
  kaca: "🔵", elektronik: "💻", organik: "🌿",
  besi: "⚙️", kardus: "📦", default: "🗑️"
};

const FILTER_TABS = [
  { key: "all", label: "Semua" },
  { key: "completed", label: "Selesai" },
  { key: "on_the_way", label: "Di Jalan" },
  { key: "arrived", label: "Tiba" },
  { key: "pending", label: "Menunggu" },
  { key: "cancelled", label: "Batal" },
];

function Riwayat() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [expanded, setExpanded] = useState(null);

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

  useEffect(() => { fetchAll(); }, []);

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
  const cancelledCount = pickups.filter(p => p.status === "cancelled").length;
  const successRate = pickups.length > 0 ? Math.round((completedCount / pickups.length) * 100) : 0;

  return (
    <>
      <Navbar
        title="Riwayat"
        subtitle="Histori lengkap penjemputan"
        hideActions={true}
      />

      <div className="page-body" style={{ paddingBottom: "6rem" }}>

        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0f4c2a 0%, #16a34a 60%, #22c55e 100%)",
          borderRadius: "20px",
          padding: "1.5rem",
          marginBottom: "1.25rem",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)"
          }} />
          <div style={{
            position: "absolute", bottom: -30, right: 40,
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)"
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{
              background: "rgba(255,255,255,0.2)", borderRadius: "12px",
              width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Award size={22} color="white" />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", fontWeight: 600, margin: 0 }}>Performa Kamu</p>
              <h2 style={{ color: "white", fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>Statistik Penjemputan</h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "0.85rem", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{completedCount}</div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.75)", fontWeight: 600, marginTop: 2 }}>Order Selesai</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "0.85rem", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{totalWeight.toFixed(1)}<span style={{ fontSize: "0.85rem" }}> kg</span></div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.75)", fontWeight: 600, marginTop: 2 }}>Total Sampah</div>
            </div>
          </div>
        </div>

        {/* Mini Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{
            background: "white", borderRadius: "16px", padding: "1rem",
            border: "1.5px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            display: "flex", alignItems: "center", gap: "0.75rem"
          }}>
            <div style={{ width: 38, height: 38, borderRadius: "10px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#16a34a", lineHeight: 1 }}>{successRate}%</div>
              <div style={{ fontSize: "0.67rem", color: "#64748b", fontWeight: 600 }}>Tingkat Sukses</div>
            </div>
          </div>
          <div style={{
            background: "white", borderRadius: "16px", padding: "1rem",
            border: "1.5px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            display: "flex", alignItems: "center", gap: "0.75rem"
          }}>
            <div style={{ width: 38, height: 38, borderRadius: "10px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <History size={18} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#d97706", lineHeight: 1 }}>{pickups.length}</div>
              <div style={{ fontSize: "0.67rem", color: "#64748b", fontWeight: 600 }}>Total Order</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Filter size={13} color="#64748b" />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b" }}>Filter Status</span>
            </div>
            <button
              onClick={() => setSortDesc(!sortDesc)}
              style={{
                display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem",
                fontWeight: 700, color: "#16a34a", background: "#f0fdf4",
                border: "1.5px solid #bbf7d0", borderRadius: "8px",
                padding: "0.3rem 0.65rem", cursor: "pointer"
              }}
            >
              {sortDesc ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              {sortDesc ? "Terbaru" : "Terlama"}
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: "0.35rem 0.8rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700,
                  border: filter === tab.key ? "none" : "1.5px solid #e2e8f0",
                  background: filter === tab.key ? "linear-gradient(135deg, #16a34a, #22c55e)" : "white",
                  color: filter === tab.key ? "white" : "#64748b",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: filter === tab.key ? "0 4px 12px rgba(22,163,74,0.3)" : "none"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "1rem", fontWeight: 600 }}>Memuat riwayat...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "20px", padding: "2.5rem 1.5rem",
            textAlign: "center", border: "1.5px dashed #e2e8f0"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📋</div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem" }}>Belum Ada Riwayat</div>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.5 }}>
              {filter === "all" ? "Kamu belum punya riwayat order apapun." : `Tidak ada order dengan status "${FILTER_TABS.find(t=>t.key===filter)?.label}".`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filtered.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = st.icon;
              const isExp = expanded === order.id;
              const emoji = WASTE_EMOJI[(order.waste_type || "").toLowerCase()] || WASTE_EMOJI.default;

              return (
                <div
                  key={order.id}
                  style={{
                    background: "white", borderRadius: "18px",
                    border: isExp ? "2px solid #16a34a" : "1.5px solid #e2e8f0",
                    boxShadow: isExp ? "0 8px 24px rgba(22,163,74,0.12)" : "0 2px 10px rgba(0,0,0,0.04)",
                    overflow: "hidden", transition: "all 0.25s ease"
                  }}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpanded(isExp ? null : order.id)}
                    style={{ padding: "1rem 1.1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.85rem" }}
                  >
                    {/* Emoji Icon */}
                    <div style={{
                      width: 46, height: 46, borderRadius: "12px", flexShrink: 0,
                      background: st.bg, border: `1.5px solid ${st.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.4rem"
                    }}>
                      {emoji}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>Order #{order.id}</span>
                          <span style={{
                            fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.55rem", borderRadius: "20px",
                            color: st.color, background: st.bg, border: `1px solid ${st.border}`
                          }}>
                            {st.label}
                          </span>
                        </div>
                        <div style={{ color: "#94a3b8" }}>
                          {isExp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "capitalize", display: "flex", alignItems: "center", gap: 3 }}>
                          <Package size={11} /> {order.waste_type || "Umum"}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", display: "flex", alignItems: "center", gap: 3 }}>
                          <Scale size={11} /> {order.actual_weight ? `${order.actual_weight} kg` : `Est. ${order.estimated_weight || "-"} kg`}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}>
                          <Calendar size={11} />
                          {order.created_at ? new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExp && (
                    <div style={{
                      padding: "1rem 1.1rem 1.1rem",
                      borderTop: "1px solid #f1f5f9",
                      background: "#fafafa",
                      display: "flex", flexDirection: "column", gap: "0.75rem"
                    }}>
                      {/* Status Banner */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        background: st.bg, borderRadius: "10px", padding: "0.65rem 0.85rem",
                        border: `1px solid ${st.border}`
                      }}>
                        <StatusIcon size={15} color={st.color} />
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: st.color }}>Status: {st.label}</span>
                      </div>

                      {/* Detail Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                        <div style={{ background: "white", borderRadius: "10px", padding: "0.75rem", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>BERAT ESTIMASI</div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>{order.estimated_weight || "-"} <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b" }}>kg</span></div>
                        </div>
                        <div style={{ background: "white", borderRadius: "10px", padding: "0.75rem", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>BERAT AKTUAL</div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 800, color: order.actual_weight ? "#16a34a" : "#94a3b8" }}>
                            {order.actual_weight ? `${order.actual_weight}` : "-"} {order.actual_weight && <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>kg</span>}
                          </div>
                        </div>
                        <div style={{ background: "white", borderRadius: "10px", padding: "0.75rem", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>TANGGAL ORDER</div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </div>
                        </div>
                        <div style={{ background: "white", borderRadius: "10px", padding: "0.75rem", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>PENGGUNA</div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>User #{order.user_id || "-"}</div>
                        </div>
                      </div>

                      {/* Address */}
                      {order.address && (
                        <div style={{ background: "white", borderRadius: "10px", padding: "0.75rem", border: "1px solid #e2e8f0", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                          <MapPin size={13} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700, marginBottom: 3 }}>ALAMAT PENJEMPUTAN</div>
                            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#0f172a", lineHeight: 1.5 }}>{order.address}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Footer count */}
            <div style={{ textAlign: "center", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, padding: "0.5rem" }}>
              Menampilkan {filtered.length} dari {pickups.length} order
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Riwayat;
