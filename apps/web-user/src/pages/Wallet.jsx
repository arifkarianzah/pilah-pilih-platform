import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import BottomNav from "../components/BottomNav";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, Menu } from "lucide-react";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const [walletRes, transRes] = await Promise.all([
          api.get("/wallet", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/wallet/transactions", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBalance(Number(walletRes.data.balance) || 0);
        setTransactions(transRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch wallet data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [navigate]);

  return (
    <div className="app-container">
      {/* Header Hijau */}
      <div className="dash-header-bg" style={{ paddingBottom: "4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button className="topbar-menu-btn" onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))} style={{ display: "flex", background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "8px", borderRadius: "8px" }}>
            <Menu size={22} />
          </button>
          <div className="icon-btn" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)" }}>
            <WalletIcon size={20} color="white" />
          </div>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Dompet Saya</h2>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#a7f3d0", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Total Saldo Saat Ini</p>
          <h1 style={{ fontSize: "2.8rem", margin: 0, fontWeight: "700" }}>
            {loading ? "..." : `Rp ${balance.toLocaleString("id-ID")}`}
          </h1>
        </div>
      </div>

      <div className="main-content" style={{ marginTop: "-2.5rem", position: "relative", zIndex: 2, padding: "0 5%" }}>
        <div className="quick-actions-card" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-evenly" }}>
          <Link to="/withdraw" className="action-item" style={{ flex: "none", width: "100px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
              <ArrowUpRight size={24} color="#166534" />
            </div>
            <span style={{ color: "#1e293b", fontSize: "0.8rem" }}>Tarik Saldo</span>
          </Link>
          <Link to="/history" className="action-item" style={{ flex: "none", width: "100px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
              <History size={24} color="#64748b" />
            </div>
            <span style={{ color: "#1e293b", fontSize: "0.8rem" }}>Riwayat</span>
          </Link>
        </div>

        <div className="main-menu-section" style={{ padding: "0", maxWidth: "800px", margin: "0 auto" }}>
          <h3 className="section-title">Transaksi Terakhir</h3>
          {transactions.length === 0 ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "2.5rem 1.5rem", textAlign: "center", color: "#94a3b8", border: "1px dashed #cbd5e1" }}>
              Belum ada transaksi tercatat. <br />
              Kumpulkan lebih banyak saldo dengan menyetorkan sampahmu!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {transactions.map(trx => (
                <div key={trx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "1rem", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", color: "#1e293b" }}>{trx.description || (trx.type === "credit" ? "Pemasukan" : "Penarikan")}</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{new Date(trx.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div style={{ fontWeight: "700", color: trx.type === "credit" ? "#10b981" : "#ef4444" }}>
                    {trx.type === "credit" ? "+" : "-"} Rp {Number(trx.amount).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default Wallet;
