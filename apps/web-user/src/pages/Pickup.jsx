import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, MapPin, Truck, ChevronDown, Bell, ShieldCheck, Clock, Leaf, Star, MessageSquare, Send } from "lucide-react";

function Pickup() {
  const [wasteType, setWasteType] = useState("Plastik");
  const [weightEstimate, setWeightEstimate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if(!token) return;
        const [profileRes, notifRes] = await Promise.all([
          api.get("/auth/profile", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({data: {user: null}})),
          api.get("/notifications", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({data: {notifications: []}}))
        ]);
        
        const savedPic = localStorage.getItem("profilePic");
        if (savedPic) setProfilePic(savedPic);

        if(profileRes?.data?.user) setProfile(profileRes.data.user);
        if(notifRes?.data?.notifications) {
          setUnreadCount(notifRes.data.notifications.filter(n => !n.is_read).length);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const wasteDescriptions = {
    "Plastik": "Botol plastik, kemasan, gelas plastik, dll",
    "Kertas": "Kardus, koran, buku bekas, dll",
    "Kaca": "Botol kaca beling, toples, dll",
    "Logam": "Kaleng aluminium, besi tua, dll",
    "Campuran": "Kumpulan berbagai jenis sampah daur ulang"
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!weightEstimate || Number(weightEstimate) <= 0) {
      setError("Masukkan estimasi berat yang valid.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post("/pickups", {
        waste_type: wasteType,
        estimated_weight: Number(weightEstimate),
        address: address + (notes ? ` (Catatan: ${notes})` : ''),
        pickup_date: new Date().toISOString().split('T')[0]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Request penjemputan berhasil dikirim!");
      setTimeout(() => navigate("/history"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim request.");
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "100px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .pkp-header { background: white; padding: 1.5rem 2.5%; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; zIndex: 10; border-bottom: 1px solid #f1f5f9; }
        .pkp-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0; }
        .pkp-back-btn { background: white; border: 1px solid #e2e8f0; border-radius: 12px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
        .pkp-back-btn:hover { background: #f8fafc; }
        
        .pkp-card { background: white; border-radius: 20px; padding: 2rem; max-width: 900px; margin: 2rem auto; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        
        .pkp-banner { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; position: relative; }
        .pkp-banner-left { display: flex; align-items: center; gap: 1rem; z-index: 2; }
        .pkp-icon-box { width: 56px; height: 56px; border-radius: 16px; background: #dcfce7; display: flex; align-items: center; justify-content: center; }
        .pkp-banner-title { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem 0; }
        .pkp-banner-subtitle { font-size: 0.85rem; color: #16a34a; margin: 0; font-weight: 600; }
        .pkp-banner-bg { position: absolute; right: -2rem; top: -2rem; height: 120px; opacity: 0.8; z-index: 1; pointer-events: none; }
        
        .pkp-label { display: block; font-size: 0.75rem; font-weight: 800; color: #475569; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .pkp-input-container { position: relative; border: 1px solid #cbd5e1; border-radius: 12px; padding: 1rem; display: flex; align-items: center; justify-content: space-between; background: white; transition: border-color 0.2s, box-shadow 0.2s; margin-bottom: 1.5rem; overflow: hidden; }
        .pkp-input-container:focus-within { border-color: var(--brand-green); box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1); }
        .pkp-input-left { display: flex; align-items: center; gap: 1rem; flex: 1; }
        .pkp-input-icon { width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; }
        
        .pkp-input-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0 0 0.15rem 0; }
        .pkp-input-subtitle { font-size: 0.8rem; color: #64748b; margin: 0; }
        
        .pkp-native-select { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
        .pkp-native-input { width: 100%; border: none; outline: none; font-size: 0.95rem; font-weight: 700; color: #1e293b; background: transparent; padding: 0; margin-bottom: 0.15rem; }
        .pkp-native-input::placeholder { color: #94a3b8; font-weight: 500; }
        
        .pkp-btn-change { background: transparent; border: 1px solid #e2e8f0; border-radius: 20px; padding: 0.4rem 0.8rem; font-size: 0.75rem; font-weight: 600; color: #16a34a; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 0.25rem; }
        .pkp-btn-change:hover { background: #f0fdf4; border-color: #bbf7d0; }
        
        .pkp-textarea { width: 100%; border: none; outline: none; font-size: 0.9rem; color: #1e293b; resize: none; background: transparent; padding: 0; height: 40px; }
        
        .pkp-benefits { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; background: #f8fafc; border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem; }
        .pkp-benefit-item { display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        .pkp-benefit-title { font-size: 0.75rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 0.35rem; }
        .pkp-benefit-desc { font-size: 0.7rem; color: #64748b; margin: 0; line-height: 1.4; }
        
        .pkp-btn-submit { width: 100%; background: #064e3b; color: white; border: none; padding: 1.1rem; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.5rem; transition: background 0.2s; box-shadow: 0 4px 12px rgba(6, 78, 59, 0.2); }
        .pkp-btn-submit:hover { background: #022c22; }
        .pkp-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .pkp-footer-note { display: flex; align-items: center; justify-content: center; gap: 0.35rem; font-size: 0.75rem; color: #64748b; margin-top: 1rem; font-weight: 500; }
        
        @media (max-width: 768px) {
          .pkp-benefits { grid-template-columns: 1fr 1fr; }
          .pkp-banner-bg { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="pkp-header">
        <button onClick={() => navigate(-1)} className="pkp-back-btn">
          <ArrowLeft size={20} color="#1e293b" />
        </button>
        <h2 className="pkp-title">Request Pickup</h2>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div onClick={() => navigate('/notifications')} style={{ position: "relative", cursor: "pointer", background: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
            <Bell size={20} color="#475569" style={{margin: "auto"}} />
            {unreadCount > 0 && (
              <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "16px", height: "16px", background: "#ef4444", borderRadius: "50%", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "9px", fontWeight: "bold" }}>{unreadCount > 9 ? '9+' : unreadCount}</div>
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
            <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#1e293b", display: "block" }}>{profile?.name ? profile.name.split(' ')[0] : 'User'}</span>
            <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#b45309", padding: "0.1rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>{profile?.role === 'pengepul' ? 'Mitra' : 'Gold'}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 5%" }}>
        <div className="pkp-card">
          
          <div className="pkp-banner">
            <div className="pkp-banner-left">
              <div className="pkp-icon-box">
                 <Truck size={28} color="#16a34a" />
              </div>
              <div>
                <h2 className="pkp-banner-title">Jemput Sampah</h2>
                <p className="pkp-banner-subtitle">Isi form untuk request penjemputan sampah</p>
              </div>
            </div>
            {/* Dekorasi Kanan (bisa diganti dengan gambar aktual jika ada) */}
            <div style={{ position: "relative", width: "120px", height: "80px" }}>
              <div style={{ position: "absolute", right: 0, top: "-10px", width: "60px", height: "80px", background: "#22c55e", borderRadius: "8px", opacity: 0.9 }}>
                 <div style={{display:"flex", alignItems:"center", justifyContent:"center", height:"100%"}}><Truck color="white" size={32}/></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleRequest}>
            {error && <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1.5rem", background: "#fee2e2", padding: "1rem", borderRadius: "12px", fontWeight: "600" }}>{error}</div>}
            {success && <div style={{ color: "#166534", fontSize: "0.85rem", marginBottom: "1.5rem", background: "#dcfce7", padding: "1rem", borderRadius: "12px", fontWeight: "600" }}>{success}</div>}

            <label className="pkp-label">Jenis Sampah</label>
            <div className="pkp-input-container">
              <select 
                className="pkp-native-select"
                value={wasteType} 
                onChange={(e) => setWasteType(e.target.value)}
              >
                {Object.keys(wasteDescriptions).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <div className="pkp-input-left">
                <div className="pkp-input-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                  <Leaf size={18} />
                </div>
                <div>
                  <p className="pkp-input-title">{wasteType}</p>
                  <p className="pkp-input-subtitle">{wasteDescriptions[wasteType]}</p>
                </div>
              </div>
              <ChevronDown size={20} color="#94a3b8" />
            </div>

            <label className="pkp-label">Estimasi Berat (KG)</label>
            <div className="pkp-input-container" style={{ cursor: "text" }}>
              <div className="pkp-input-left">
                <div className="pkp-input-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: "800" }}>KG</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="pkp-native-input" 
                      placeholder="Masukkan estimasi berat"
                      value={weightEstimate}
                      onChange={(e) => setWeightEstimate(e.target.value)}
                      required
                    />
                    <span style={{ fontWeight: "700", color: "#1e293b", marginLeft: "-10px", paddingRight: "10px" }}>kg</span>
                  </div>
                  <p className="pkp-input-subtitle">Berat dapat berubah saat penjemputan</p>
                </div>
              </div>
            </div>

            <label className="pkp-label">Alamat Penjemputan</label>
            <div className="pkp-input-container">
              <div className="pkp-input-left">
                <div className="pkp-input-icon" style={{ background: "#f1f5f9", color: "#10b981" }}>
                  <MapPin size={18} />
                </div>
                <div style={{ flex: 1, paddingRight: "1rem" }}>
                  <input 
                    type="text" 
                    className="pkp-native-input" 
                    placeholder="Masukkan alamat lengkap..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  <p className="pkp-input-subtitle">Pastikan alamat penjemputan sudah benar</p>
                </div>
              </div>
            </div>

            <label className="pkp-label">Catatan (Opsional)</label>
            <div className="pkp-input-container">
              <div className="pkp-input-left" style={{ alignItems: "flex-start" }}>
                <div className="pkp-input-icon" style={{ background: "#f1f5f9", color: "#10b981" }}>
                  <MessageSquare size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <textarea 
                    className="pkp-textarea"
                    placeholder="Contoh: Sampah diletakkan depan pagar rumah"
                    value={notes}
                    onChange={(e) => {
                      if(e.target.value.length <= 100) setNotes(e.target.value);
                    }}
                  ></textarea>
                  <div style={{ textAlign: "right", fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600", marginTop: "0.25rem" }}>
                    {notes.length}/100
                  </div>
                </div>
              </div>
            </div>

            <div className="pkp-benefits">
              <div className="pkp-benefit-item">
                <h4 className="pkp-benefit-title"><ShieldCheck size={16} color="#16a34a" /> Aman & Terpercaya</h4>
                <p className="pkp-benefit-desc">Penjemputan oleh petugas terverifikasi</p>
              </div>
              <div className="pkp-benefit-item">
                <h4 className="pkp-benefit-title"><Clock size={16} color="#16a34a" /> Cepat & Tepat Waktu</h4>
                <p className="pkp-benefit-desc">Penjemputan sesuai jadwal pilihanmu</p>
              </div>
              <div className="pkp-benefit-item">
                <h4 className="pkp-benefit-title"><Leaf size={16} color="#16a34a" /> Ramah Lingkungan</h4>
                <p className="pkp-benefit-desc">Sampahmu membantu lingkungan lebih bersih</p>
              </div>
              <div className="pkp-benefit-item">
                <h4 className="pkp-benefit-title"><Star size={16} color="#f59e0b" /> Dapatkan Poin</h4>
                <p className="pkp-benefit-desc">Setiap penjemputan dapatkan reward poin</p>
              </div>
            </div>

            <button type="submit" className="pkp-btn-submit">
              <Send size={18} /> Kirim Request Pickup
            </button>
            
            <div className="pkp-footer-note">
              <ShieldCheck size={14} color="#16a34a" /> Data kamu aman dan hanya digunakan untuk penjemputan sampah
            </div>
            
          </form>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}

export default Pickup;
