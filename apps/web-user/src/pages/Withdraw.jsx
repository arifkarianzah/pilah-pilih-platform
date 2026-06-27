import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BottomNav from "../components/BottomNav";
import { Wallet, Smartphone, Coins, Upload, Bell, Moon, Sun, ArrowUpRight, Clock, CheckCircle2, XCircle, ShieldCheck, Crown, Send, ChevronRight, FileText, Menu } from "lucide-react"; 

const withdrawalMethods = [
  { id: "dana", name: "DANA", color: "#118EEA", icon: "dana" },
  { id: "ovo", name: "OVO", color: "#4C2A86", icon: "ovo" },
  { id: "gopay", name: "GoPay", color: "#00AED6", icon: "gopay" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D", icon: "shopee" },
  { id: "bank", name: "Bank Transfer", color: "#005E9D", icon: "bank" }
];

function Withdraw() {
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [method, setMethod] = useState("dana");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if(!token) return;
        const [profileRes, walletRes, txRes, notifRes, dashRes] = await Promise.all([
          api.get("/auth/profile", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({data: {user: {name: 'User', role: 'user'}}})),
          api.get("/wallet", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({data: {balance: 0}})),
          api.get("/wallet/withdrawals", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({data: {data: []}})),
          api.get("/notifications", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({data: {notifications: []}})),
          api.get("/dashboard/user", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({data: {total_pickup: 0}}))
        ]);
        
        const savedPic = localStorage.getItem("profilePic");
        if (savedPic) setProfilePic(savedPic);

        setProfile(profileRes.data.user || profileRes.data);
        setBalance(walletRes.data.balance !== undefined ? Number(walletRes.data.balance) : 0);
        if(dashRes?.data) {
          setPoints((dashRes.data.total_pickup || 0) * 25);
        }
        if(txRes?.data?.data) {
          setTransactions(txRes.data.data); // Keep all for calculations
        }
        if(notifRes?.data?.notifications) {
          setNotifications(notifRes.data.notifications);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (Number(amount) > balance) {
      setError("Saldo tidak mencukupi untuk penarikan ini.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post("/wallet/withdraw", {
        amount: Number(amount),
        bank_name: selectedMethod?.name || method,
        account_number: bankAccount,
        account_name: profile?.name || "User"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Permintaan penarikan berhasil! Dana akan diproses.");
      setTimeout(() => navigate("/wallet"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal melakukan penarikan.");
    }
  };

  const selectedMethod = withdrawalMethods.find(m => m.id === method);
  
  // Calculate stats from transactions (withdrawals)
  const totalPenarikan = transactions.filter(tx => tx.status === 'approved' || tx.status === 'pending').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalMenunggu = transactions.filter(tx => tx.status === 'pending').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const countMenunggu = transactions.filter(tx => tx.status === 'pending').length;
  const totalBerhasil = transactions.filter(tx => tx.status === 'approved').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const countBerhasil = transactions.filter(tx => tx.status === 'approved').length;
  const totalDitolak = transactions.filter(tx => tx.status === 'rejected').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const countDitolak = transactions.filter(tx => tx.status === 'rejected').length;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="app-container" style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "120px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .wd-grid-top { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .wd-grid-main { display: grid; grid-template-columns: 1fr 1.2fr; gap: 1.5rem; }
        .wd-card { background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .wd-method-pill { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: 12px; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-weight: 600; font-size: 0.85rem; border: 1px solid #e2e8f0; }
        .wd-method-pill.active { border-color: var(--brand-green); color: var(--brand-green); background: #f0fdf4; }
        .wd-input-group { margin-bottom: 1rem; }
        .wd-label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 600; margin-bottom: 0.5rem; }
        .wd-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .wd-input:focus { border-color: var(--brand-green); }
        .wd-icon-input { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .wd-summary-box { background: #f8fafc; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .wd-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
        .wd-btn-submit { width: 100%; background: var(--brand-green); color: white; border: none; padding: 0.85rem; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.5rem; transition: background 0.2s; }
        .wd-btn-submit:hover { background: var(--brand-green-light); }
        .wd-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .wd-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .wd-table th { text-align: left; padding: 1rem 0.5rem; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9; }
        .wd-table td { padding: 1rem 0.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .wd-status-badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; display: inline-block; text-transform: capitalize; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #b45309; }
        .status-rejected { background: #fee2e2; color: #b91c1c; }
        
        @media (max-width: 1024px) {
          .wd-grid-top { grid-template-columns: 1fr 1fr; }
          .wd-grid-top > div:first-child { grid-column: span 2; }
          .wd-grid-main { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .wd-grid-top { grid-template-columns: 1fr; }
          .wd-grid-top > div:first-child { grid-column: span 1; }
        }
      `}</style>

      <div style={{ padding: "1.5rem 2.5%", maxWidth: "1440px", margin: "0 auto" }}>
        
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="topbar-menu-btn" onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))} style={{ display: "flex" }}>
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 0.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Selamat sore, {profile?.name ? profile.name.split(' ')[0] : 'User'} 👋
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>Kelola saldo dan tarik dana dengan mudah dan aman.</p>
          </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div onClick={() => navigate('/notifications')} style={{ position: "relative", cursor: "pointer", background: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
              <Bell size={20} color="#475569" />
              {unreadCount > 0 && (
                <div style={{ position: "absolute", top: "0px", right: "0px", width: "16px", height: "16px", background: "#ef4444", borderRadius: "50%", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "9px", fontWeight: "bold" }}>{unreadCount > 9 ? '9+' : unreadCount}</div>
              )}
            </div>
            <div onClick={() => navigate('/profile')} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "white", padding: "0.4rem 1rem 0.4rem 0.4rem", borderRadius: "30px", border: "1px solid #e2e8f0", cursor: "pointer" }}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "2px solid white" }} />
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--brand-green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.9rem" }}>
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#1e293b" }}>{profile?.name ? profile.name.split(' ')[0] : 'User'}</span>
              <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#b45309", padding: "0.1rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>{profile?.role === 'pengepul' ? 'Mitra' : 'Gold'}</span>
            </div>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="wd-grid-top">
          {/* Card 1: Saldo */}
          <div style={{ background: "linear-gradient(135deg, var(--brand-green) 0%, var(--brand-green-light) 100%)", borderRadius: "16px", padding: "1.25rem", color: "white", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: "-10%", bottom: "-10%", opacity: 0.1 }}><Wallet size={120} /></div>
            <div>
              <p style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.25rem", fontWeight: "500" }}>Saldo Tersedia</p>
              <h2 style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>Rp {balance.toLocaleString("id-ID")}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", marginTop: "1rem", fontWeight: "600" }}>
              <span style={{ color: "#fbbf24" }}>★</span> Total Poin <span>★ {points.toLocaleString('id-ID')} pts</span>
            </div>
          </div>
          
          {/* Card 2: Penarikan */}
          <div className="wd-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", marginBottom: "0.25rem" }}>Total Penarikan</p>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--brand-green)", margin: "0 0 0.5rem 0" }}>Rp {totalPenarikan.toLocaleString("id-ID")}</h3>
            <p style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "600", margin: 0 }}><ArrowUpRight size={14}/> 8% dari bulan lalu</p>
          </div>

          {/* Card 3: Menunggu */}
          <div className="wd-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", marginBottom: "0.25rem" }}>Menunggu</p>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1e293b", margin: "0 0 0.5rem 0" }}>Rp {totalMenunggu.toLocaleString("id-ID")}</h3>
            <p style={{ fontSize: "0.75rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "600", margin: 0 }}><Clock size={14}/> {countMenunggu} transaksi</p>
          </div>

          {/* Card 4: Berhasil */}
          <div className="wd-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", marginBottom: "0.25rem" }}>Berhasil</p>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1e293b", margin: "0 0 0.5rem 0" }}>Rp {totalBerhasil.toLocaleString("id-ID")}</h3>
            <p style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "600", margin: 0 }}><CheckCircle2 size={14}/> {countBerhasil} transaksi</p>
          </div>

          {/* Card 5: Ditolak */}
          <div className="wd-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", marginBottom: "0.25rem" }}>Ditolak</p>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1e293b", margin: "0 0 0.5rem 0" }}>Rp {totalDitolak.toLocaleString("id-ID")}</h3>
            <p style={{ fontSize: "0.75rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "600", margin: 0 }}><XCircle size={14}/> {countDitolak} transaksi</p>
          </div>
        </div>

        {/* Main Columns */}
        <div className="wd-grid-main">
          
          {/* LEFT COL: Tarik Saldo Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="wd-card">
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", marginBottom: "1.25rem" }}>Tarik Saldo</h2>
              
              <p className="wd-label">Pilih Metode Penarikan</p>
              <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "1rem", margin: "0 -0.5rem", padding: "0 0.5rem 1rem 0.5rem" }}>
                {withdrawalMethods.map(item => (
                  <div key={item.id} className={`wd-method-pill ${method === item.id ? "active" : ""}`} onClick={() => setMethod(item.id)}>
                    {method === item.id && <CheckCircle2 size={16} />}
                    <span style={{ color: item.color, fontStyle: "italic", fontWeight: "900" }}>{item.icon === 'bank' ? <Wallet size={16}/> : item.name}</span>
                    {item.icon !== 'bank' && <span style={{ color: method === item.id ? "var(--brand-green)" : "#475569" }}>{item.name}</span>}
                  </div>
                ))}
              </div>

              <form onSubmit={handleWithdraw}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  {/* Left Form Inputs */}
                  <div>
                    <div className="wd-input-group">
                      <label className="wd-label">Nomor Tujuan</label>
                      <div style={{ position: "relative" }}>
                        <Smartphone size={18} className="wd-icon-input" />
                        <input type="text" className="wd-input" placeholder="0812 3456 7890" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} required />
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.4rem" }}>Pastikan nomor {selectedMethod?.name} aktif</p>
                    </div>
                    
                    <div className="wd-input-group">
                      <label className="wd-label">Nominal Penarikan</label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <span style={{ position: "absolute", left: "12px", fontSize: "0.9rem", color: "#64748b", fontWeight: "600" }}>Rp</span>
                        <input type="number" className="wd-input" style={{ paddingLeft: "2.5rem" }} placeholder="100.000" value={amount} onChange={(e) => setAmount(e.target.value)} required min="10000" />
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.4rem" }}>Minimal penarikan Rp 10.000</p>
                    </div>
                  </div>

                  {/* Right Summary */}
                  <div>
                    <div className="wd-summary-box">
                      <div className="wd-summary-row">
                        <span style={{ color: "#64748b" }}>Saldo Tersedia</span>
                        <span style={{ fontWeight: "700" }}>Rp {balance.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="wd-summary-row">
                        <span style={{ color: "#64748b" }}>Biaya Admin</span>
                        <span style={{ fontWeight: "700" }}>Rp 0</span>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "0.25rem 0" }}></div>
                      <div className="wd-summary-row" style={{ fontSize: "0.9rem" }}>
                        <span style={{ color: "#1e293b", fontWeight: "700" }}>Total Diterima</span>
                        <span style={{ color: "var(--brand-green)", fontWeight: "800" }}>Rp {amount ? Number(amount).toLocaleString("id-ID") : "0"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "1rem" }}>{error}</p>}
                {success && <p style={{ color: "#10b981", fontSize: "0.8rem", marginTop: "1rem" }}>{success}</p>}

                <div style={{ marginTop: "1.5rem" }}>
                  <button type="submit" className="wd-btn-submit" disabled={Number(amount) > balance || !amount}>
                    <Send size={18} /> Tarik Sekarang
                  </button>
                  <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "0.75rem" }}>
                    <ShieldCheck size={14} /> Transaksi aman dan terenkripsi
                  </p>
                </div>
              </form>
            </div>

            {/* Informasi Penarikan Card */}
            <div className="wd-card" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "1rem" }}>Informasi Penarikan</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["Minimal penarikan Rp 10.000", "Proses penarikan 1x24 jam", "Pastikan nomor tujuan benar", "Saldo akan masuk sesuai metode yang dipilih"].map((text, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#475569" }}>
                    <CheckCircle2 size={16} color="#10b981" /> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT COL: Riwayat & Level */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Riwayat Card */}
            <div className="wd-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Riwayat Penarikan Terakhir</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--brand-green)", fontWeight: "600", cursor: "pointer", border: "1px solid var(--brand-green)", padding: "0.3rem 0.6rem", borderRadius: "8px" }}>Lihat Semua</span>
              </div>
              
              <div style={{ overflowX: "auto" }}>
                <table className="wd-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Metode</th>
                      <th>Nominal</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Belum ada riwayat penarikan</td>
                      </tr>
                    ) : transactions.slice(0, 5).map((tx, idx) => {
                      // Ambil styling method
                      const mtd = withdrawalMethods.find(m => m.name.toLowerCase() === tx.bank_name.toLowerCase() || m.id === tx.bank_name.toLowerCase()) || { name: tx.bank_name, color: "#64748b" };
                      
                      return (
                        <tr key={idx}>
                          <td style={{ color: "#475569" }}>
                            {new Date(tx.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600" }}>
                            <span style={{ background: mtd.color, color: "white", padding: "0.2rem 0.4rem", borderRadius: "6px", fontSize: "0.6rem", fontStyle: "italic" }}>{mtd.name.substring(0,4)}</span> {mtd.name}
                          </td>
                          <td style={{ fontWeight: "600" }}>Rp {Number(tx.amount).toLocaleString("id-ID")}</td>
                          <td><span className={`wd-status-badge status-${tx.status}`}>{tx.status}</span></td>
                          <td><span style={{ fontSize: "0.75rem", border: "1px solid #e2e8f0", padding: "0.3rem 0.6rem", borderRadius: "6px", cursor: "pointer", color: "#64748b" }}>Detail</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <button style={{ width: "100%", padding: "0.75rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "600", color: "#475569", cursor: "pointer" }}>
                  Lihat Semua Riwayat
                </button>
              </div>
            </div>

            {/* Level Up Card */}
            <div style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", borderRadius: "16px", padding: "1.5rem", border: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#b45309", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Crown size={20} color="#d97706" /> Tingkatkan Level Kamu</h3>
                <p style={{ fontSize: "0.8rem", color: "#78350f", marginBottom: "1rem" }}>Capai level berikutnya untuk nikmati keuntungan lebih besar!</p>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1, height: "6px", background: "white", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: "57%", height: "100%", background: "#d97706", borderRadius: "3px" }}></div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#92400e", fontWeight: "600" }}>{points.toLocaleString('id-ID')} / 2.000 pts menuju Platinum</span>
                </div>

                <button style={{ background: "white", border: "1px solid #fcd34d", color: "#d97706", padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>
                  Lihat Benefit
                </button>
              </div>
              <div style={{ width: "100px", height: "100px", background: "var(--brand-green)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, transform: "rotate(-10deg)", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
                <Wallet size={48} color="white" />
                <div style={{ position: "absolute", top: -15, left: -15, background: "#f59e0b", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}><Coins size={16} color="white"/></div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <BottomNav />
    </div>
  );
}

export default Withdraw;
