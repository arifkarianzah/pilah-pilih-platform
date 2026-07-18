import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BottomNav from "../components/BottomNav";
import { ArrowLeft } from "lucide-react";

const TABS = ["Semua", "Menunggu", "Berjalan", "Selesai", "Dibatalkan"];

function History() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Semua");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if(!token) return;
        const res = await api.get("/pickups/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPickups(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak valid";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("id-ID", { month: "short" });
    const time = date.toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
    return `${day} ${month}, ${time}`;
  };

  const formatPrice = (price) => {
    if (!price) return "Rp 0";
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  };

  // Filter logic
  const filteredPickups = pickups.filter(pickup => {
    if (activeTab === "Semua") return true;
    const status = (pickup.status || "").toLowerCase();
    if (activeTab === "Menunggu" && status === "pending") return true;
    if (activeTab === "Berjalan" && ["accepted", "on_the_way", "arrived", "collected", "waiting_collector", "weighing"].includes(status)) return true;
    if (activeTab === "Selesai" && status === "completed") return true;
    if (activeTab === "Dibatalkan" && status === "cancelled") return true;
    return false;
  });

  return (
    <div className="app-container" style={{ background: "#f8fafc", paddingBottom: "100px", minHeight: "100vh" }}>
      {/* Header Putih */}
      <div style={{ background: "white", padding: "1.5rem 5% 1rem 5%", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>Riwayat Pickup</h2>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f1f5f9" }}></div>
      </div>

      <div className="main-content" style={{ padding: "0" }}>
        
        {/* Tabs Scrollable */}
        <div style={{ background: "white", padding: "0.75rem 5% 1rem 5%", display: "flex", gap: "0.5rem", overflowX: "auto", msOverflowStyle: "none", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", borderBottom: "1px solid #f1f5f9" }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: "0 0 auto",
                width: "max-content",
                whiteSpace: "nowrap",
                padding: "0.5rem 1.25rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                background: activeTab === tab ? "#e2f5ec" : "white",
                color: activeTab === tab ? "var(--brand-green)" : "#64748b",
                border: activeTab === tab ? "1px solid var(--brand-green)" : "1px solid #e2e8f0",
                transition: "all 0.2s"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List Riwayat */}
        <div style={{ padding: "1.5rem 5%", display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px", margin: "0 auto" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Memuat riwayat...</p>
          ) : filteredPickups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#94a3b8", fontWeight: "500" }}>Belum ada riwayat untuk kategori ini.</p>
            </div>
          ) : (
            filteredPickups.map((pickup, index) => {
              const status = (pickup.status || "pending").toUpperCase();
              let statusColor = "#64748b";
              let statusBg = "#f1f5f9";
              
              if (status === "COMPLETED") {
                statusColor = "#166534";
                statusBg = "#dcfce7";
              } else if (status === "PENDING") {
                statusColor = "#b45309";
                statusBg = "#fef3c7";
              } else if (["ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(status)) {
                statusColor = "#1e40af";
                statusBg = "#dbeafe";
              } else if (["COLLECTED", "WAITING_COLLECTOR", "WEIGHING"].includes(status)) {
                statusColor = "#5b21b6";
                statusBg = "#ede9fe";
              } else if (status === "CANCELLED") {
                statusColor = "#991b1b";
                statusBg = "#fee2e2";
              }

              return (
                <div key={pickup.id || index} style={{ background: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", letterSpacing: "0.5px" }}>
                      {(pickup.id ? `TRX-${pickup.id}` : `TXN${Math.floor(Math.random()*10000)}`).toString().toUpperCase().slice(0, 12)}
                    </span>
                    <span style={{ background: statusBg, color: statusColor, padding: "0.25rem 0.75rem", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "800", letterSpacing: "0.5px" }}>
                      {status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1e293b", margin: "0 0 0.5rem 0" }}>
                    Jual {pickup.waste_type || pickup.wasteType || "Campur"} ({pickup.actual_weight || pickup.estimated_weight || pickup.weightEstimate || 0} kg)
                  </h3>

                  <p style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>
                    {status === "COMPLETED" ? `+ Rp ${Number(pickup.total_price || 0).toLocaleString('id-ID')}` : "Estimasi..."}
                  </p>

                  <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: "500", margin: 0 }}>
                    {formatDate(pickup.created_at || pickup.createdAt || pickup.date || new Date())}
                  </p>
                </div>
              );
            })
          )}
        </div>

      </div>
      
      <BottomNav />
    </div>
  );
}

export default History;
