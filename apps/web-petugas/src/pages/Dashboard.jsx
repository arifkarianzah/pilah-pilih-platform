import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPickups, updatePickupStatus } from "../services/pickupService";
import api from "../services/api";
import {
  Recycle, Bell, Wallet, Map, Clock, CheckCircle2, Truck,
  ClipboardList, MapPin, Navigation, ChevronRight, Play,
  ScanLine, Scale, History, ShoppingBag, MessageCircle
} from "lucide-react";

const HARGA = {
  plastik: 2000, kertas: 1500, logam: 5000,
  kaca: 1000, elektronik: 10000, organik: 500, besi: 5000,
  "botol plastik": 2000, kardus: 1000, "buku/hps": 1500
};

const customStyles = `
  .dash-container {
    padding: 2rem 2.5rem;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 100px;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }
  .grid-4-res {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
  .grid-2-res {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .action-btn {
    transition: all 0.2s ease;
  }
  @media (max-width: 1024px) {
    .dash-container {
      padding: 1.5rem;
    }
    .grid-4-res {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .grid-2-res {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 768px) {
    .dash-container {
      padding: 1rem;
      overflow-x: hidden;
      max-width: 100vw;
    }
    .grid-4-res {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 0.6rem;
    }
    .grid-2-res {
      grid-template-columns: minmax(0, 1fr);
      gap: 1.5rem;
    }
    .responsive-header {
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: center !important;
      gap: 0.5rem !important;
    }
    .header-left {
      width: auto !important;
    }
    .header-left-title {
      font-size: 1rem !important;
    }
    .header-left-subtitle {
      font-size: 0.65rem !important;
    }
    .header-left-icon {
      width: 24px !important;
      height: 24px !important;
    }
    .header-actions {
      width: auto !important;
      justify-content: flex-end !important;
      gap: 0.5rem !important;
    }
    .online-badge {
      padding: 0.3rem 0.5rem !important;
      font-size: 0.65rem !important;
    }
    .avatar-badge {
      width: 32px !important;
      height: 32px !important;
      font-size: 0.8rem !important;
    }
    .responsive-greeting {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 1rem;
    }
  }
`;

function Dashboard() {
  const [pickups, setPickups] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userInitials = user.name ? user.name.substring(0, 2).toUpperCase() : "WW";

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const resPickups = await getAllPickups();
      setPickups(resPickups.data || []);
      
      const resWallet = await api.get("/wallet");
      setWalletBalance(Number(resWallet.data.balance) || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // Compute stats
  const today = new Date().toDateString();
  const todayPickups = pickups.filter(p => new Date(p.created_at).toDateString() === today);
  const pending = pickups.filter(p => p.status === "pending");
  const activePickups = pickups.filter(p => ["accepted", "on_the_way"].includes(p.status));
  const todayCompleted = todayPickups.filter(p => p.status === "completed");
  
  const currentOrder = activePickups.length > 0 ? activePickups[0] : null;
  const currentHarga = currentOrder ? HARGA[currentOrder.waste_type?.toLowerCase()] || 1000 : 0;
  const estPrice = currentOrder ? (currentOrder.estimated_weight * currentHarga) : 0;

  const handleMulaiJemput = async () => {
    if (!currentOrder) return;
    try {
      await updatePickupStatus(currentOrder.id, "on_the_way");
      fetchDashboardData();
      alert("Status order telah diubah menjadi Dalam Perjalanan!");
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status order.");
    }
  };

  const handleLihatDetail = () => {
    if (!currentOrder) return;
    navigate(`/orders/${currentOrder.id}`);
  };

  const pendapatanHariIni = todayCompleted.reduce((sum, p) => {
    const harga = HARGA[p.waste_type?.toLowerCase()] || 1000;
    return sum + (parseFloat(p.actual_weight || 0) * harga);
  }, 0);

  return (
    <>
      <style>{customStyles}</style>
      <div className="dash-container">
        
        {/* HEADER */}
        <div className="responsive-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Recycle className="header-left-icon" color="var(--primary)" size={32} />
              <div>
                <h1 className="header-left-title" style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.1, margin: 0, color: 'var(--text)' }}>PILAH PILIH</h1>
                <p className="header-left-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Petugas Sampah</p>
              </div>
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="online-badge" style={{ background: 'var(--success-light)', color: 'var(--brand)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }} /> Online
            </div>
            
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <div onClick={() => setShowNotif(!showNotif)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                <Bell size={22} color="var(--text)" />
                {pending.length > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger)', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                    {pending.length}
                  </span>
                )}
              </div>
              
              {showNotif && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '-10px',
                  marginTop: '10px',
                  width: '320px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid var(--border)',
                  zIndex: 50,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>Notifikasi Order</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 700, background: 'var(--success-light)', padding: '2px 8px', borderRadius: '10px' }}>{pending.length} Baru</span>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {pending.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tidak ada order baru menunggu.</div>
                    ) : (
                      pending.map(p => (
                        <div key={p.id} onClick={() => navigate(`/orders/${p.id}`)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.2s', background: 'white', display: 'flex', gap: '12px' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ShoppingBag size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Order Baru: {p.waste_type}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.address}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--brand)', fontWeight: 700, marginTop: '6px' }}>{new Date(p.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="avatar-badge" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/profil')}>
              {userInitials}
            </div>
          </div>
        </div>

        {/* GREETING */}
        <div className="responsive-greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Selamat datang, {userInitials}! 👋</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0, fontWeight: 500 }}>Tetap semangat dan jaga lingkungan tetap bersih 🍃</p>
          </div>
          <div style={{ textAlign: 'right', background: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Peringkat Anda ⭐ <span style={{ fontWeight: 800, color: 'var(--text)' }}>4.8</span></div>
            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 800, marginTop: '4px' }}>+12 poin minggu ini</div>
          </div>
        </div>

        {/* STATS GRID (4 cols on desktop, 2 on mobile) */}
        <div className="grid-4-res" style={{ marginBottom: '1.5rem' }}>
          <div className="card" onClick={() => navigate('/orders')} style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: 'var(--success-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={14} />
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Total Order</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>{pickups.length}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 700 }}>Semua riwayat</div>
          </div>
          <div className="card" onClick={() => navigate('/orders')} style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#fff7ed', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} />
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Menunggu</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>{pending.length}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cek daftar order</div>
          </div>
          <div className="card" style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#eff6ff', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={14} />
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Aktif</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>{activePickups.length}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 700 }}>● Sedang berjalan</div>
          </div>
          <div className="card" onClick={() => navigate('/riwayat')} style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: 'var(--success-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={14} />
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Total Selesai</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>{pickups.filter(p => p.status === "completed").length}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 700 }}>▲ {todayCompleted.length} hr ini</div>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT FOR DESKTOP */}
        <div className="grid-2-res" style={{ marginBottom: '2rem' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
            {/* INCOME CARD */}
            <div className="card" onClick={() => navigate('/tarik-saldo')} style={{ background: 'linear-gradient(135deg, #064e3b, #0f4c2a)', color: 'white', padding: '1.15rem', position: 'relative', overflow: 'hidden', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,76,42,0.2)' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 600 }}>Saldo Dompet Petugas</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, margin: '6px 0', letterSpacing: '-0.3px' }}>Rp {walletBalance.toLocaleString('id-ID')}</div>
                <div style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 600 }}>Tarik Saldo & Top Up &rarr;</div>
              </div>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.8, width: 48, height: 48, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={24} color="white" />
              </div>
              <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '60%', height: '80%', zIndex: 0 }} viewBox="0 0 100 50" preserveAspectRatio="none">
                <path d="M0,45 L15,35 L35,40 L55,25 L80,40 L100,20" fill="none" stroke="#34d399" strokeWidth="2.5" />
                <circle cx="0" cy="45" r="3" fill="#34d399" />
                <circle cx="15" cy="35" r="3" fill="#34d399" />
                <circle cx="35" cy="40" r="3" fill="#34d399" />
                <circle cx="55" cy="25" r="3" fill="#34d399" />
                <circle cx="80" cy="40" r="3" fill="#34d399" />
                <circle cx="100" cy="20" r="3" fill="#34d399" />
              </svg>
            </div>

            {/* MAP CARD */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--text)', fontSize: '1rem' }}>
                  <MapPin size={20} color="var(--brand)" /> Lokasi Order Aktif
                </div>
                <button style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                  <Map size={16} /> Lihat Peta
                </button>
              </div>

              {currentOrder ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', border: '1px solid var(--border)' }}>
                <div style={{ height: 320, width: '100%', position: 'relative' }}>
                  <svg width="100%" height="100%" style={{ opacity: 0.1 }}>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <path d="M 80,220 L 140,240 L 160,140 L 300,100 L 400,180 L 460,110" fill="none" stroke="#064e3b" strokeWidth="6" strokeLinejoin="round" />
                    <circle cx="80" cy="220" r="10" fill="#3b82f6" stroke="white" strokeWidth="3" />
                    <path d="M 440,90 L 460,110 L 480,90" fill="none" stroke="#064e3b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '35%', fontSize: '0.85rem', color: 'var(--text-muted)', transform: 'rotate(-10deg)', fontWeight: 600 }}>Pekanbaru</div>
                </div>
                
                <div style={{ position: 'absolute', top: '10%', right: '5%', background: 'white', borderRadius: '12px', padding: '16px', width: '240px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ background: 'var(--success-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>#{currentOrder.id}</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'capitalize' }}>{currentOrder.waste_type}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500 }}>~ {currentOrder.estimated_weight} kg • Rp {estPrice.toLocaleString('id-ID')}</div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <MapPin size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{currentOrder.address}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Status: <span style={{ color: currentOrder.status === 'on_the_way' ? '#3b82f6' : '#ea580c', fontWeight: 700, textTransform: 'capitalize' }}>{currentOrder.status.replace('_', ' ')}</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-full" 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentOrder.address)}`, '_blank')}
                    style={{ padding: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '8px', borderRadius: '8px', background: '#022c22' }}
                  >
                    <Navigation size={16} /> Navigasi
                  </button>
                </div>
              </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
                  <Truck size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>Tidak ada order aktif yang sedang berjalan.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
            {/* ACTIVE ORDER LIST */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>Order Aktif</div>
                <div onClick={() => navigate('/orders')} style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Lihat semua <ChevronRight size={18}/></div>
              </div>

              {currentOrder ? (
                <>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <div style={{ width: 100, height: 100, background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Recycle size={40} color="var(--text-light)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', textTransform: 'capitalize' }}>{currentOrder.waste_type}</div>
                        <button onClick={() => navigate(`/chat?userId=${currentOrder.user_id}`)} style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(15,76,42,0.3)' }}>
                          <MessageCircle size={18} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, margin: '4px 0' }}>~ {currentOrder.estimated_weight} kg • Rp {estPrice.toLocaleString('id-ID')}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '0.85rem' }}>
                        <MapPin size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{currentOrder.address}</div>
                        </div>
                      </div>
                      <div style={{ background: currentOrder.status === 'on_the_way' ? '#eff6ff' : 'var(--warning-light)', color: currentOrder.status === 'on_the_way' ? '#3b82f6' : '#ea580c', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginTop: '10px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {currentOrder.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button className="btn btn-outline" onClick={handleLihatDetail} style={{ flex: 1, padding: '12px', fontSize: '0.9rem', borderRadius: '8px' }}>
                      <ClipboardList size={18} /> Lihat Detail
                    </button>
                    {currentOrder.status !== 'on_the_way' && (
                      <button className="btn btn-primary" onClick={handleMulaiJemput} style={{ flex: 1, padding: '12px', fontSize: '0.9rem', borderRadius: '8px' }}>
                        <Play size={18} fill="currentColor" /> Mulai Jemput
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontWeight: 500 }}>Belum ada order aktif.</p>
                  <button onClick={() => navigate('/orders')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Cari Order Baru</button>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Aksi Cepat</div>
              <div style={{ gap: '0.75rem', display: 'flex', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <div className="card action-btn" onClick={() => navigate('/timbang')} style={{ minWidth: '65px', flex: 1, padding: '0.85rem 0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                  <ScanLine size={24} color="var(--brand)" />
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center' }}>Scan</div>
                </div>
                <div className="card action-btn" onClick={() => navigate('/timbang')} style={{ minWidth: '65px', flex: 1, padding: '0.85rem 0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                  <Scale size={24} color="var(--brand)" />
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center' }}>Timbang</div>
                </div>
                <div className="card action-btn" onClick={() => navigate('/riwayat')} style={{ minWidth: '65px', flex: 1, padding: '0.85rem 0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                  <History size={24} color="var(--brand)" />
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center' }}>Riwayat</div>
                </div>
                <div className="card action-btn" onClick={() => navigate('/tarik-saldo')} style={{ minWidth: '65px', flex: 1, padding: '0.85rem 0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                  <Wallet size={24} color="var(--brand)" />
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center' }}>Tarik Saldo</div>
                </div>
                <div className="card action-btn" onClick={() => navigate('/topup')} style={{ minWidth: '65px', flex: 1, padding: '0.85rem 0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                  <ShoppingBag size={24} color="var(--brand)" />
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center' }}>Top Up</div>
                </div>
                <div className="card action-btn" onClick={() => navigate('/chat')} style={{ minWidth: '65px', flex: 1, padding: '0.85rem 0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)' }}>
                  <MessageCircle size={24} color="var(--brand)" />
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center' }}>Chat</div>
                </div>
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Notifikasi</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Lihat semua <ChevronRight size={16}/></div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--success-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShoppingBag size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Order baru masuk</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Ada order baru di sekitar Anda</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>2 menit lalu</div>
                    <ChevronRight size={14} color="var(--text-light)" />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--success-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Order selesai</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Order #2 telah selesai</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>1 jam lalu</div>
                    <ChevronRight size={14} color="var(--text-light)" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
