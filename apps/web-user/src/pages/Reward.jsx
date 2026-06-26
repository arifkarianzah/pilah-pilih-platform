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

        {/* === Compact Points Card === */}
        <div className="mini-level-card" style={{ marginBottom: "1rem" }}>
          <h4 className="mini-level-title">Total Poin Anda: {totalPoin.toLocaleString("id-ID")} pts</h4>
          <p className="mini-level-desc">
            Level Gold ⭐ • Perlu {neededPoin.toLocaleString("id-ID")} poin lagi untuk naik ke Platinum.
          </p>
        </div>

        {/* === TABS === */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>

          <button style={{ background: "#064e3b", color: "white", border: "none", padding: "0.6rem 1.25rem", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", boxShadow: "0 2px 6px rgba(6, 78, 59, 0.2)" }}>
            <Gift size={16} /> Tukar Poin
          </button>

          <button style={{ background: "white", color: "#0f172a", border: "1px solid #e2e8f0", padding: "0.6rem 1.25rem", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#064e3b"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            <Trophy size={16} color="#64748b" /> Leaderboard
          </button>

          <button style={{ background: "white", color: "#0f172a", border: "1px solid #e2e8f0", padding: "0.6rem 1.25rem", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#064e3b"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            <Medal size={16} color="#64748b" /> Badge
          </button>

        </div>

        {/* === 2 COLUMNS BOTTOM === */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="reward-columns">

          {/* COLUMN 1: Cara Mendapatkan Poin */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>Cara Mendapatkan Poin</h3>

            <div style={{ background: "white", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "0" }}>

              {/* Item 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <RefreshCcw size={18} color="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Jual Sampah</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Dapatkan poin dari setiap penjualan sampah</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", marginLeft: "0.5rem" }}>10 poin / Rp 1k</span>
              </div>

              {/* Item 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Truck size={18} color="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Pickup Selesai</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Dapatkan poin setiap pickup berhasil</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", marginLeft: "0.5rem" }}>50 poin</span>
              </div>

              {/* Item 3 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star size={18} color="#064e3b" fill="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Aktivitas Harian</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Check-in harian & aktivitas</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", marginLeft: "0.5rem" }}>5 - 20 poin</span>
              </div>

              {/* Item 4 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Share2 size={18} color="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Ajak Teman</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Undang teman gabung</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", marginLeft: "0.5rem" }}>100 poin</span>
              </div>

              {/* Action Button */}
              <button style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7", padding: "0.75rem", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"} onMouseLeave={e => e.currentTarget.style.background = "#f0fdf4"}>
                Lihat Semua Cara Mendapatkan Poin <ChevronRight size={14} />
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Smartphone size={18} color="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Pulsa Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Telkomsel, XL, Indosat, Tri</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#eab308" }}>1.200 poin</span>
                  <ChevronRight size={14} color="#cbd5e1" />
                </div>
              </div>

              {/* Reward 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wallet size={18} color="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Voucher GoPay Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Saldo GoPay</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#eab308" }}>1.500 poin</span>
                  <ChevronRight size={14} color="#cbd5e1" />
                </div>
              </div>

              {/* Reward 3 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingBag size={18} color="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Voucher Shopee Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Voucher Shopee</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#eab308" }}>1.500 poin</span>
                  <ChevronRight size={14} color="#cbd5e1" />
                </div>
              </div>

              {/* Reward 4 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wallet size={18} color="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Saldo DANA Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Saldo DANA</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#eab308" }}>1.500 poin</span>
                  <ChevronRight size={14} color="#cbd5e1" />
                </div>
              </div>

              {/* Reward 5 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingCart size={18} color="#064e3b" />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>Voucher Tokopedia Rp 10.000</h4>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Voucher Tokopedia</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#eab308" }}>1.500 poin</span>
                  <ChevronRight size={14} color="#cbd5e1" />
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
