import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BottomNav from "../components/BottomNav";
import {
  ArrowLeft, Bell, Sun, ChevronDown, Trophy, Medal, Award,
  Diamond, Gift, RefreshCcw, Star, Share2, Wallet,
  ShoppingBag, ShoppingCart, ChevronRight, Truck, Smartphone
} from "lucide-react";

function Reward() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Tukar Poin");
  const [totalPickup, setTotalPickup] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/dashboard/user", { headers: { Authorization: `Bearer ${token}` } });
        setTotalPickup(res.data.total_pickup || 0);
      } catch (err) {
        console.error("Failed to fetch points", err);
      }
    };
    fetchData();
  }, []);

  const totalPoin = totalPickup * 25;
  const nextTarget = 3500;
  const neededPoin = Math.max(0, nextTarget - totalPoin);
  const progressPercent = Math.min(100, (totalPoin / nextTarget) * 100);

  return (
    <div className="app-container" style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "100px", fontFamily: "'Inter', sans-serif" }}>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>

        {/* === HEADER === */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>

          {/* Left Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>

            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.2rem 0" }}>Reward & Poin</h1>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>Kumpulkan poin dan tukar dengan berbagai hadiah menarik</p>
            </div>
          </div>


        </div>

        {/* === MAIN DARK GREEN CARD === */}
        <div style={{ background: "#064e3b", borderRadius: "24px", padding: "2.5rem", color: "white", position: "relative", overflow: "hidden", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem", boxShadow: "0 10px 30px rgba(6, 78, 59, 0.2)" }}>

          {/* Subtle Leaf Pattern Background */}
          <div style={{ position: "absolute", right: "-5%", bottom: "-10%", opacity: 0.1, transform: "scale(1.5)", pointerEvents: "none" }}>
            <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M140,200 C80,200 20,150 20,100 C20,50 80,0 140,0 C180,0 200,40 200,100 C200,160 180,200 140,200 Z" fill="#dcfce7" />
              <path d="M160,180 Q100,80 180,40 Q190,120 160,180" fill="#22c55e" />
            </svg>
          </div>

          {/* Left Info */}
          <div style={{ position: "relative", zIndex: 1, minWidth: "250px" }}>
            <div style={{ background: "#eab308", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.8rem", borderRadius: "20px", marginBottom: "1.5rem" }}>
              <Trophy size={14} color="white" />
              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "white" }}>GOLD</span>
            </div>

            <p style={{ fontSize: "0.9rem", color: "#a7f3d0", margin: "0 0 0.2rem 0", fontWeight: "600" }}>Total Poin Anda</p>
            <h1 style={{ fontSize: "3.5rem", fontWeight: "800", margin: "0 0 1rem 0" }}>
              {totalPoin.toLocaleString("id-ID")} <span style={{ fontSize: "1.2rem", fontWeight: "600", color: "#a7f3d0" }}>pts</span>
            </h1>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#eab308", fontSize: "0.85rem", fontWeight: "600", background: "rgba(234, 179, 8, 0.15)", padding: "0.4rem 0.8rem", borderRadius: "8px" }}>
              <Star size={16} fill="#eab308" /> {neededPoin.toLocaleString("id-ID")} poin lagi untuk naik ke Platinum
            </div>
          </div>

          {/* Right Progress Timeline */}
          <div style={{ flex: 1, minWidth: "400px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

            {/* Timeline Nodes */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", marginBottom: "2rem" }}>
              {/* Connecting Line */}
              <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "2px", background: "rgba(255,255,255,0.2)", zIndex: 0 }}></div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", position: "relative", zIndex: 1 }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#78350f", border: "4px solid #064e3b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={20} color="#fcd34d" />
                </div>
                <span style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "600" }}>Bronze</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", position: "relative", zIndex: 1 }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#94a3b8", border: "4px solid #064e3b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Medal size={20} color="white" />
                </div>
                <span style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "600" }}>Silver</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", position: "relative", zIndex: 1 }}>
                <div style={{ width: "55px", height: "55px", borderRadius: "50%", background: "#f59e0b", border: "4px solid #064e3b", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(245, 158, 11, 0.6)" }}>
                  <Trophy size={24} color="white" />
                </div>
                <span style={{ fontSize: "0.85rem", color: "white", fontWeight: "800" }}>Gold</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", position: "relative", zIndex: 1 }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "4px solid #064e3b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Diamond size={20} color="#cbd5e1" />
                </div>
                <span style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "600" }}>Platinum</span>
              </div>
            </div>

            {/* Progress Bar & Text */}
            <div>
              <div style={{ height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden", marginBottom: "0.8rem" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", background: "#10b981", borderRadius: "5px", boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}>Perlu {neededPoin.toLocaleString("id-ID")} poin lagi <ArrowLeft size={10} style={{ transform: "rotate(180deg)", margin: "0 4px" }} /> Platinum</span>
                <span style={{ fontSize: "0.85rem", color: "#a7f3d0", fontWeight: "700" }}>{totalPoin.toLocaleString("id-ID")} / {nextTarget.toLocaleString("id-ID")} poin</span>
              </div>
            </div>

          </div>
        </div>

        {/* === TABS === */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", marginBottom: "2rem", flexWrap: "wrap" }}>

          <button style={{ background: "#064e3b", color: "white", border: "none", padding: "1rem 2rem", borderRadius: "16px", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", boxShadow: "0 4px 10px rgba(6, 78, 59, 0.2)" }}>
            <Gift size={18} /> Tukar Poin
          </button>

          <button style={{ background: "white", color: "#0f172a", border: "1px solid #e2e8f0", padding: "1rem 2rem", borderRadius: "16px", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#064e3b"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            <Trophy size={18} color="#64748b" /> Leaderboard
          </button>

          <button style={{ background: "white", color: "#0f172a", border: "1px solid #e2e8f0", padding: "1rem 2rem", borderRadius: "16px", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#064e3b"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            <Medal size={18} color="#64748b" /> Badge
          </button>

        </div>

        {/* === 2 COLUMNS BOTTOM === */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="reward-columns">

          {/* COLUMN 1: Cara Mendapatkan Poin */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>Cara Mendapatkan Poin</h3>

            <div style={{ background: "white", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "0" }}>

              {/* Item 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "45px", height: "45px", borderRadius: "12px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <RefreshCcw size={20} color="#16a34a" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Jual Sampah</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Dapatkan poin dari setiap penjualan sampah</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>10 poin / Rp 1.000</span>
              </div>

              {/* Item 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "45px", height: "45px", borderRadius: "12px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Truck size={20} color="#0284c7" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Pickup Selesai</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Dapatkan poin setiap pickup berhasil</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>50 poin</span>
              </div>

              {/* Item 3 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "45px", height: "45px", borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star size={20} color="#d97706" fill="#d97706" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Aktivitas Harian</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Check-in harian dan aktivitas lainnya</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>5 - 20 poin</span>
              </div>

              {/* Item 4 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "45px", height: "45px", borderRadius: "12px", background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Share2 size={20} color="#9333ea" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Ajak Teman</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Undang teman dan dapatkan poin</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>100 poin / teman</span>
              </div>

              {/* Action Button */}
              <button style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7", padding: "1rem", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"} onMouseLeave={e => e.currentTarget.style.background = "#f0fdf4"}>
                Lihat Semua Cara Mendapatkan Poin <ChevronRight size={16} />
              </button>

            </div>
          </div>

          {/* COLUMN 2: Hadiah Populer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>Hadiah Populer</h3>
              <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center" }}>Lihat Semua <ChevronRight size={14} /></span>
            </div>

            <div style={{ background: "white", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "0" }}>

              {/* Reward 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Smartphone size={18} color="#ef4444" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Pulsa Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Telkomsel, XL, Indosat, Tri</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#eab308" }}>1.200 poin</span>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              </div>

              {/* Reward 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wallet size={18} color="#0ea5e9" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Voucher GoPay Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Saldo GoPay</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#eab308" }}>1.500 poin</span>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              </div>

              {/* Reward 3 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingBag size={18} color="#f97316" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Voucher Shopee Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Voucher Shopee</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#eab308" }}>1.500 poin</span>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              </div>

              {/* Reward 4 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wallet size={18} color="#3b82f6" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Saldo DANA Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Saldo DANA</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#eab308" }}>1.500 poin</span>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              </div>

              {/* Reward 5 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingCart size={18} color="#22c55e" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Voucher Tokopedia Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Voucher Tokopedia</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#eab308" }}>1.500 poin</span>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .reward-columns {
             grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <BottomNav />
    </div>
  );
}

export default Reward;
