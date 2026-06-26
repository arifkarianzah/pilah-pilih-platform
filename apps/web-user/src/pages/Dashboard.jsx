import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Layout/Sidebar";
import BottomNav from "../components/BottomNav";
import {
  Bell, Eye, EyeOff, ChevronRight, Bot, Wallet, Recycle, FileText,
  CheckCircle2, ShieldCheck, MapPin, MessageCircle, User, Gift,
  BookOpen, Truck, ArrowUpRight, TrendingUp, Star, Zap, X, Menu,
  ArrowRight, Package, Leaf
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { getUnreadCount as getUnreadChatCount } from "../services/messageService";
import socket from "../services/socket";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [stats, setStats] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesMonth, setSalesMonth] = useState("current");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activePickup, setActivePickup] = useState(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewPic, setPreviewPic] = useState(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleReadAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Failed marking all notifications as read", err);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const savedPic = localStorage.getItem("profilePic");
        if (savedPic) setPreviewPic(savedPic);

        const [profileRes, walletRes, dashboardRes, notifRes, chatRes] = await Promise.all([
          api.get("/auth/profile", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/wallet", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { balance: 0 } })),
          api.get("/dashboard/user", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { total_pickup: 0, recent_transactions: [], active_pickup: null } })),
          api.get("/notifications", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { notifications: [] } })),
          getUnreadChatCount().catch(() => ({ count: 0 })),
        ]);

        setUser(profileRes.data.user);
        setBalance(walletRes.data.balance !== undefined ? Number(walletRes.data.balance) : 0);
        setStats(dashboardRes.data.total_pickup !== undefined ? dashboardRes.data.total_pickup : 0);
        setRecentTransactions(dashboardRes.data.recent_transactions || []);
        setActivePickup(dashboardRes.data.active_pickup || null);
        setNotifications(notifRes.data.notifications || []);
        setUnreadChatCount(chatRes.count || 0);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/dashboard/sales?month=${salesMonth}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalesData(res.data.data || []);
        setSalesTotal(res.data.total || 0);
      } catch (err) {
        console.error("Failed to fetch sales data", err);
      }
    };
    fetchSales();
  }, [salesMonth]);

  useEffect(() => {
    // Socket connection
    socket.connect();
    
    if (user && user.id) {
        socket.emit("join", user.id);
    }

    const handlePickupUpdate = (data) => {
        // Refresh dashboard data if there is an update
        if (data.pickupId) {
            // Optional: check if the pickup belongs to user, but since we just refresh, it's fine.
            // A more optimized way is to only refresh if data.pickupId matches activePickup, 
            // but for simplicity we can just trigger a fetch.
            // Fetching just the user dashboard data:
            const token = localStorage.getItem("token");
            if(token) {
                api.get("/dashboard/user", { headers: { Authorization: `Bearer ${token}` } })
                   .then(res => {
                       setStats(res.data.total_pickup !== undefined ? res.data.total_pickup : 0);
                       setRecentTransactions(res.data.recent_transactions || []);
                       setActivePickup(res.data.active_pickup || null);
                   })
                   .catch(console.error);
                // Also fetch notifications
                api.get("/notifications", { headers: { Authorization: `Bearer ${token}` } })
                   .then(res => setNotifications(res.data.notifications || []))
                   .catch(console.error);
            }
        }
    };

    socket.on("pickup_status_changed", handlePickupUpdate);

    return () => {
        socket.off("pickup_status_changed", handlePickupUpdate);
        socket.disconnect();
    };
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const quickActions = [
    { to: "/jual-sampah", icon: <Recycle size={24} />, label: "Jual Sampah", color: "#166534", bg: "rgba(22,101,52,0.12)" },
    { to: "/ai-scan",    icon: <Bot size={24} />,     label: "AI Scan",    color: "#166534", bg: "rgba(22,101,52,0.12)" },
    { to: "/pickup",     icon: <Truck size={24} />,   label: "Jemput Sampah", color: "#166534", bg: "rgba(22,101,52,0.12)" },
    { to: "/withdraw",   icon: <Wallet size={24} />,  label: "Tarik Saldo", color: "#166534", bg: "rgba(22,101,52,0.12)" },
    { to: "/reward",     icon: <Gift size={24} />,    label: "Reward",     color: "#166534", bg: "rgba(22,101,52,0.12)" },
    { to: "/history",    icon: <FileText size={24} />,label: "Riwayat",    color: "#166534", bg: "rgba(22,101,52,0.12)" },
    { to: "/edukasi",    icon: <BookOpen size={24} />,label: "Edukasi",    color: "#166534", bg: "rgba(22,101,52,0.12)" },
    { to: "/chat",       icon: <MessageCircle size={24} />, label: "Chat", color: "#166534", bg: "rgba(22,101,52,0.12)", badge: unreadChatCount },
  ];

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dash-shell">
      {/* ── Sidebar ── */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main Content ── */}
      <div className="dash-main">
        {/* ── Top Header ── */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="topbar-greeting">
              <span className="topbar-greeting-hi">{greeting()}, 👋</span>
              <span className="topbar-name">{user?.name || "Pengguna"}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div style={{ position: "relative" }}>
              <button className="topbar-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notif-popup">
                  <div className="notif-popup-header">
                    <h4>Notifikasi</h4>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {unreadCount > 0 && (
                        <button onClick={handleReadAllNotifications} className="notif-read-all">
                          Tandai semua dibaca
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="notif-close-btn">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="notif-popup-body">
                    {notifications.length === 0 ? (
                      <p className="notif-empty">Belum ada notifikasi.</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div key={n.id} className={`notif-item ${!n.is_read ? "unread" : ""}`}>
                          <div className="notif-item-dot" />
                          <div>
                            <p className="notif-item-title">{n.title}</p>
                            <p className="notif-item-msg">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/profile" className="topbar-avatar">
              {previewPic ? (
                <img src={previewPic} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </Link>
          </div>
        </header>

        {/* ── Page Content ── */}
        <div className="dash-content">

          {/* ─── Row 1: Saldo Card ─── */}
          <div className="balance-card">
            <div className="balance-card-top">
              <div>
                <div className="balance-label">
                  Saldo Aktif
                  <button className="balance-eye-btn" onClick={() => setBalanceVisible(!balanceVisible)}>
                    {balanceVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="balance-amount">
                  {balanceVisible
                    ? `Rp ${balance.toLocaleString("id-ID")}`
                    : "Rp ••••••••"}
                </div>
                <div className="balance-points-chip">
                  <Star size={12} />
                  <span>{(stats * 25).toLocaleString("id-ID")} Poin</span>
                  <ChevronRight size={12} />
                </div>
              </div>
              <div className="balance-card-badge">
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>

          {/* ─── Menu Cepat ─── */}
          <div className="section-card">
            <div className="section-card-header">
              <h3>Menu Cepat</h3>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((a) => (
                <Link key={a.to} to={a.to} className="quick-action-item">
                  <div className="quick-action-icon" style={{ background: a.bg, color: a.color }}>
                    {a.icon}
                    {a.badge > 0 && (
                      <span className="quick-action-badge">{a.badge}</span>
                    )}
                  </div>
                  <span className="quick-action-label">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Compact Points Card ─── */}
          <div className="mini-level-card">
            <h4 className="mini-level-title">Total Poin Anda: {(stats * 25).toLocaleString("id-ID")} pts</h4>
            <p className="mini-level-desc">
              Level Gold ⭐ • Perlu {2000 - (stats * 25)} poin lagi untuk naik ke Platinum.
            </p>
          </div>

          {/* ─── Row 3: Chart + Active Pickup ─── */}
          <div className="dash-row-3">
            {/* Sales Chart */}
            <div className="section-card chart-card">
              <div className="section-card-header">
                <div>
                  <h3>Statistik Penjualan</h3>
                  <p className="section-subtitle">Total: <strong>Rp {Number(salesTotal || 0).toLocaleString("id-ID")}</strong></p>
                </div>
                <select
                  value={salesMonth}
                  onChange={(e) => setSalesMonth(e.target.value)}
                  className="chart-select"
                >
                  <option value="current">Bulan Ini</option>
                  <option value="last">Bulan Lalu</option>
                </select>
              </div>
              <div style={{ width: "100%", height: 200 }}>
                {salesData.length === 0 ? (
                  <div className="chart-empty">
                    <TrendingUp size={40} />
                    <p>Belum ada data penjualan.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${v / 1000}K`} />
                      <Tooltip
                        formatter={(v) => [`Rp ${v.toLocaleString("id-ID")}`, "Penjualan"]}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "0.85rem" }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 4, fill: "#10b981", stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Active Pickup Status */}
            <div className="section-card pickup-card">
              <div className="section-card-header">
                <h3>Status Penjemputan</h3>
                <Link to="/pickup" className="link-see-all">Buat Baru <ArrowRight size={14} /></Link>
              </div>

              {!activePickup ? (
                <div className="pickup-empty">
                  <Truck size={40} strokeWidth={1.5} />
                  <p>Belum ada penjemputan aktif.</p>
                  <Link to="/pickup" className="pickup-cta-btn">
                    Jadwalkan Sekarang
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="pickup-status-badge">
                    {activePickup.status === "completed" ? "Selesai ✅" :
                     activePickup.status === "weighing" ? "Sedang Ditimbang ⚖️" :
                     ["collected", "waiting_collector"].includes(activePickup.status) ? "Dalam Pengiriman 🚛" :
                     activePickup.status === "arrived" ? "Petugas Tiba 📍" :
                     ["accepted", "on_the_way"].includes(activePickup.status) ? "Petugas Menuju Lokasi 🚀" :
                     "Menunggu Konfirmasi ⏳"}
                  </div>
                  <p className="pickup-address-text">
                    <MapPin size={14} /> {activePickup.address}
                  </p>

                  {/* Steps */}
                  <div className="pickup-stepper" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', position: 'relative' }}>
                    {["Diajukan", "Di Jalan", "Diangkut", "Ditimbang", "Selesai"].map((step, i) => {
                      const getStatusIndex = (s) => {
                          if (!s || s === "pending") return 0;
                          if (["accepted", "on_the_way", "arrived"].includes(s)) return 1;
                          if (["collected", "waiting_collector"].includes(s)) return 2;
                          if (s === "weighing") return 3;
                          if (s === "completed") return 4;
                          return 0;
                      };
                      const current = getStatusIndex(activePickup.status);
                      const done = i <= current;
                      return (
                        <div key={step} className="stepper-item" style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div className={`stepper-dot ${done ? "done" : ""}`} style={{
                              width: 20, height: 20, borderRadius: '50%',
                              background: done ? 'var(--brand)' : 'var(--surface-3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                          }}>
                            {done && <CheckCircle2 size={12} />}
                          </div>
                          <span className={`stepper-label ${done ? "done" : ""}`} style={{ fontSize: 10, color: done ? 'var(--text)' : 'var(--text-muted)' }}>{step}</span>
                          {i < 4 && <div className={`stepper-line ${i < current ? "done" : ""}`} style={{
                              position: 'absolute', top: 10, left: `calc(${(i * 25)}% + 15px)`,
                              width: 'calc(25% - 20px)', height: 2, zIndex: 1,
                              background: i < current ? 'var(--brand)' : 'var(--surface-3)'
                          }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Row 4: Transaksi Terbaru + Edukasi ─── */}
          <div className="dash-row-4">
            {/* Transaksi */}
            <div className="section-card">
              <div className="section-card-header">
                <h3>Transaksi Terakhir</h3>
                <Link to="/history" className="link-see-all">Lihat Semua <ArrowRight size={14} /></Link>
              </div>
              <div className="tx-list">
                {recentTransactions.length === 0 ? (
                  <div className="tx-empty">
                    <Package size={36} />
                    <p>Belum ada transaksi.</p>
                  </div>
                ) : (
                  recentTransactions.map((tx, i) => {
                    const d = new Date(tx.date);
                    const dateStr = `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })} • ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                    const statusLabel = tx.status === "completed" ? "Selesai" :
                                        tx.status === "pending" ? "Pending" :
                                        ["accepted", "on_the_way", "arrived"].includes(tx.status) ? "Proses Penjemputan" :
                                        ["collected", "waiting_collector", "weighing"].includes(tx.status) ? "Proses Pengepul" : tx.status;
                    const isCompleted = tx.status === "completed";
                    return (
                      <div key={`${tx.id}-${i}`} className="tx-row">
                        <div className="tx-row-icon">
                          <Recycle size={18} color="#10b981" />
                        </div>
                        <div className="tx-row-info">
                          <p className="tx-row-name">{tx.name}</p>
                          <p className="tx-row-meta">{tx.qty} Kg • {dateStr}</p>
                        </div>
                        <div className="tx-row-right">
                          <p className="tx-row-amount">Rp {Number(tx.price || 0).toLocaleString("id-ID")}</p>
                          <span className={`tx-status-badge ${isCompleted ? "completed" : "pending"}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Edukasi Card */}
            <div className="edu-promo-card">
              <div className="edu-promo-bg" />
              <div className="edu-promo-overlay" />
              <div className="edu-promo-content">
                <div className="edu-promo-top">
                  <span className="edu-promo-badge"><Leaf size={12} /> Edukasi Hari Ini</span>
                  <Link to="/edukasi" className="edu-promo-link">Lihat Semua →</Link>
                </div>
                <h3 className="edu-promo-title">Tahukah kamu?</h3>
                <p className="edu-promo-text">
                  1 ton kertas daur ulang dapat menyelamatkan 17 pohon dan menghemat 26.000 liter air bersih.
                </p>
                <Link to="/edukasi" className="edu-promo-cta">
                  Pelajari Lebih Lanjut <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <BottomNav />
    </div>
  );
}

export default Dashboard;
