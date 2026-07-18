import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BottomNav from "../components/BottomNav";
import { 
  ArrowLeft, Edit, Camera, Star, Gift, ChevronRight, 
  User, Wallet, Award, Users, History, DollarSign, 
  Moon, Globe, MessageSquare, LogOut, Shield, Bell, 
  FileText, Settings, Leaf, Truck, ChevronDown, CheckCircle, Droplet
} from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalPickup, setTotalPickup] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previewPic, setPreviewPic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      setProfile({...profile, name: editName});
      setIsEditing(false);
      await api.put("/auth/profile", { name: editName }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("Gagal menyimpan profil", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const savedPic = localStorage.getItem("profilePic");
        if (savedPic) setPreviewPic(savedPic);

        const [profileRes, walletRes, dashRes] = await Promise.all([
          api.get("/auth/profile", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/wallet", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { balance: 0 } })),
          api.get("/dashboard/user", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { total_pickup: 0 } }))
        ]);
        setProfile(profileRes.data.user || profileRes.data);
        setBalance(Number(walletRes.data.balance) || 0);
        setTotalPickup(dashRes.data.total_pickup || 0);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewPic(base64String);
        localStorage.setItem("profilePic", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <div style={{textAlign:"center", padding:"3rem"}}>Memuat profil...</div>;

  const userData = profile || {};
  const userName = userData.name || "User";
  const userEmail = userData.email || "user@email.com";
  const walletBalance = balance;
  
  const totalSold = "0 kg";
  const points = totalPickup * 10;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "1.5rem", paddingBottom: "100px", fontFamily: "'Inter', sans-serif" }}>

      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* === TOP HEADER CARD === */}
        <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", position: "relative", overflow: "hidden" }}>
          
          {/* Leaf Vector Art Background */}
          <div style={{ position: "absolute", right: "-30px", bottom: "-30px", opacity: 0.9, pointerEvents: "none", zIndex: 0 }}>
            <svg width="250" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M140,200 C80,200 20,150 20,100 C20,50 80,0 140,0 C180,0 200,40 200,100 C200,160 180,200 140,200 Z" fill="#dcfce7" opacity="0.6"/>
              <path d="M160,180 Q100,80 180,40 Q190,120 160,180" fill="#22c55e" opacity="0.9"/>
              <path d="M100,190 Q40,110 130,50 Q160,140 100,190" fill="#16a34a"/>
              <path d="M190,150 Q150,80 200,60 Q210,120 190,150" fill="#15803d" opacity="0.8"/>
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1, flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* Profile Avatar */}
              <div style={{ position: "relative" }}>
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "4px solid white", overflow: "hidden", background: "#e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
                  {previewPic ? (
                    <img src={previewPic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#cbd5e1" }}>
                      <User size={40} color="#94a3b8" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={handlePhotoClick}
                  style={{ position: "absolute", bottom: "0", right: "0", width: "32px", height: "32px", borderRadius: "50%", background: "#064e3b", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}
                >
                  <Camera size={14} color="white" />
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
              </div>
              
              {/* Profile Info */}
              <div>
                {isEditing ? (
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input 
                      type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0.2rem 0.5rem", outline: "none" }}
                      autoFocus
                    />
                    <button onClick={handleSaveProfile} style={{ background: "#16a34a", color: "white", border: "none", padding: "0.4rem 1rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>Simpan</button>
                  </div>
                ) : (
                  <h2 className="profile-name" style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.2rem 0" }}>{userName}</h2>
                )}
                <p className="profile-email" style={{ fontSize: "0.95rem", color: "#64748b", margin: "0 0 0.8rem 0" }}>{userEmail}</p>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  <div className="profile-level-badge" style={{ background: "#fef9c3", padding: "0.3rem 0.8rem", borderRadius: "20px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Star size={14} color="#eab308" fill="#eab308" />
                    <span style={{ color: "#ca8a04", fontSize: "0.8rem", fontWeight: "700" }}>Level Emas</span>
                  </div>
                  <span className="profile-member-since" style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <History size={14} /> Member aktif sejak 20 Juni 2026
                  </span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button className="profile-edit-btn" onClick={() => { setEditName(userName); setIsEditing(true); }} style={{ background: "white", border: "1px solid #e2e8f0", padding: "0.6rem 1.2rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem", color: "#0f172a", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}>
                <Edit size={16} /> Edit Profil
              </button>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(226, 232, 240, 0.8)", margin: "2rem 0 1.5rem 0", position: "relative", zIndex: 1 }}></div>

          {/* 4 Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", position: "relative", zIndex: 1 }}>
            
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", borderRight: "1px solid #e2e8f0" }}>
              <div className="profile-stat-icon" style={{ width: "45px", height: "45px", background: "#dcfce7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Droplet size={22} color="#16a34a" fill="#16a34a" />
              </div>
              <div>
                <h3 className="profile-stat-value" style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.1rem 0" }}>{totalSold}</h3>
                <p className="profile-stat-label" style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, fontWeight: "600" }}>Total Terjual</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", borderRight: "1px solid #e2e8f0" }}>
              <div className="profile-stat-icon" style={{ width: "45px", height: "45px", background: "#dcfce7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Truck size={22} color="#16a34a" fill="#16a34a" />
              </div>
              <div>
                <h3 className="profile-stat-value" style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.1rem 0" }}>{totalPickup}</h3>
                <p className="profile-stat-label" style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, fontWeight: "600" }}>Total Pickup</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", borderRight: "1px solid #e2e8f0" }}>
              <div className="profile-stat-icon" style={{ width: "45px", height: "45px", background: "#fef9c3", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={22} color="#eab308" fill="#eab308" />
              </div>
              <div>
                <h3 className="profile-stat-value" style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.1rem 0" }}>{points} pts</h3>
                <p className="profile-stat-label" style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, fontWeight: "600" }}>Total Poin</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div className="profile-stat-icon" style={{ width: "45px", height: "45px", background: "#fef3c7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award size={22} color="#d97706" fill="#d97706" />
              </div>
              <div>
                <h3 className="profile-stat-value" style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.1rem 0" }}>Gold</h3>
                <p className="profile-stat-label" style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, fontWeight: "600" }}>Level Member</p>
              </div>
            </div>

          </div>
        </div>

        {/* === MAIN CONTENT 2 COLUMNS === */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            


            {/* Menu Akun */}
            <div style={{ background: "white", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h3 className="profile-section-title" style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 1.5rem 0" }}>Akun</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#f8fafc", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div className="profile-menu-icon" style={{ background: "#dcfce7", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={20} color="#16a34a" />
                    </div>
                    <div>
                      <h4 className="profile-menu-title" style={{ margin: "0 0 0.15rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Edit Profil</h4>
                      <p className="profile-menu-desc" style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Ubah informasi nama, email, dan foto</p>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "white", borderRadius: "16px", cursor: "pointer", border: "1px solid transparent", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div className="profile-menu-icon" style={{ background: "#e0f2fe", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Shield size={20} color="#0284c7" />
                    </div>
                    <div>
                      <h4 className="profile-menu-title" style={{ margin: "0 0 0.15rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Keamanan</h4>
                      <p className="profile-menu-desc" style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Ubah password dan pengaturan keamanan</p>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "white", borderRadius: "16px", cursor: "pointer", border: "1px solid transparent", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div className="profile-menu-icon" style={{ background: "#fef3c7", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bell size={20} color="#d97706" />
                    </div>
                    <div>
                      <h4 className="profile-menu-title" style={{ margin: "0 0 0.15rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Notifikasi</h4>
                      <p className="profile-menu-desc" style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Atur preferensi notifikasi kamu</p>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" />
                </div>
                
              </div>
            </div>

            {/* Logout Action Area */}
            <div className="profile-logout-container" style={{ background: "white", borderRadius: "24px", padding: "1.5rem", display: "flex", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
               <button className="profile-logout-btn" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "none", color: "#ef4444", fontSize: "1rem", fontWeight: "700", cursor: "pointer" }}>
                 <LogOut size={18} /> Keluar Akun
               </button>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Ringkasan Aktivitas */}
            <div style={{ background: "white", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>Ringkasan Aktivitas</h3>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#64748b", fontWeight: "600", cursor: "pointer" }}>
                  30 Hari Terakhir <ChevronDown size={14} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", background: "#dcfce7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Leaf size={18} color="#16a34a" />
                    </div>
                    <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1e293b" }}>Sampah Terjual</span>
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>0 kg</span>
                </div>

                <div style={{ height: "1px", background: "#f1f5f9" }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", background: "#e0f2fe", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Truck size={18} color="#0284c7" />
                    </div>
                    <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1e293b" }}>Pickup Selesai</span>
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>0</span>
                </div>

                <div style={{ height: "1px", background: "#f1f5f9" }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", background: "#fef3c7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Star size={18} color="#d97706" fill="#d97706" />
                    </div>
                    <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1e293b" }}>Poin Didapatkan</span>
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>0 pts</span>
                </div>

                <div style={{ height: "1px", background: "#f1f5f9" }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", background: "#f3e8ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={18} color="#9333ea" />
                    </div>
                    <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1e293b" }}>Transaksi</span>
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>0</span>
                </div>

              </div>
            </div>

            {/* Promo Banner */}
            <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", borderRadius: "24px", padding: "2rem", display: "flex", gap: "1rem", alignItems: "center", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ flex: 1, zIndex: 1 }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#064e3b", margin: "0 0 0.5rem 0" }}>Terus Pilah, Terus Berkah! 🌱</h3>
                <p style={{ fontSize: "0.85rem", color: "#166534", margin: 0, lineHeight: "1.5" }}>Setiap aksi kecilmu untuk lingkungan memberikan dampak besar untuk masa depan.</p>
              </div>
              <div style={{ width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                {/* Simulated illustration using Lucide and CSS shapes */}
                <div style={{ position: "relative", width: "80px", height: "80px" }}>
                  <div style={{ position: "absolute", bottom: 0, width: "80px", height: "60px", background: "#22c55e", borderRadius: "8px 8px 12px 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <RefreshCwIcon /> 
                  </div>
                  {/* Bottles */}
                  <div style={{ position: "absolute", bottom: "50px", left: "10px", width: "15px", height: "40px", background: "#bae6fd", borderRadius: "4px", transform: "rotate(-15deg)" }}></div>
                  <div style={{ position: "absolute", bottom: "55px", left: "30px", width: "20px", height: "40px", background: "#fef08a", borderRadius: "4px" }}></div>
                  <div style={{ position: "absolute", bottom: "50px", right: "10px", width: "15px", height: "35px", background: "#bfdbfe", borderRadius: "4px", transform: "rotate(15deg)" }}></div>
                </div>
              </div>
              
              {/* Leaves decoration behind */}
              <div style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.3 }}>
                <Leaf size={100} color="#15803d" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Adding global style to ensure 1 column on mobile via media query */}
      <style>{`
        @media (max-width: 768px) {
          .main-content {
             padding-bottom: 80px;
          }
          div[style*="grid-template-columns: 1fr 1fr"] {
             grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      <style>{`
        @media (max-width: 640px) {
          .profile-name { font-size: 1.3rem !important; font-weight: 700 !important; }
          .profile-email { font-size: 0.8rem !important; }
          .profile-level-badge { padding: 0.2rem 0.6rem !important; font-size: 0.7rem !important; }
          .profile-member-since { font-size: 0.7rem !important; }
          .profile-edit-btn { padding: 0.4rem 0.8rem !important; font-size: 0.75rem !important; font-weight: 600 !important; }
          .profile-stat-value { font-size: 0.95rem !important; font-weight: 700 !important; }
          .profile-stat-label { font-size: 0.65rem !important; font-weight: 500 !important; }
          .profile-stat-icon { width: 36px !important; height: 36px !important; }
          .profile-stat-icon svg { width: 18px !important; height: 18px !important; }
          .profile-section-title { font-size: 0.95rem !important; font-weight: 700 !important; }
          .profile-menu-title { font-size: 0.85rem !important; font-weight: 600 !important; }
          .profile-menu-desc { font-size: 0.65rem !important; }
          .profile-menu-icon { width: 32px !important; height: 32px !important; }
          .profile-menu-icon svg { width: 16px !important; height: 16px !important; }
          .profile-logout-container { padding: 1rem !important; }
          .profile-logout-btn { font-size: 0.9rem !important; width: 100% !important; justify-content: center !important; background: #fee2e2 !important; padding: 0.8rem !important; border-radius: 12px !important; }
        }
      `}</style>
      
      <BottomNav />
    </div>
  );
}

const RefreshCwIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

export default Profile;
