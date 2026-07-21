import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, MapPin, Truck, ChevronDown, Bell, ShieldCheck, Clock, Leaf, Star, MessageSquare, Send, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Pickup.css';
import { calculateDistance, calculateFare, DEPOT_LAT } from '../utils/distance';

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

function MapPicker({ position, setPosition, setAddress }) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition([lat, lng]);
      setAddress("Mengambil detail lokasi...");
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if(data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`Titik Maps: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      } catch (err) {
        setAddress(`Titik Maps: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    },
  });
  return position ? <Marker position={position} /> : null;
}

function Pickup() {
  const [wasteType, setWasteType] = useState("Plastik");
  const [weightEstimate, setWeightEstimate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mapPosition, setMapPosition] = useState([0.5333, 101.4500]); // Pekanbaru default
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [distance, setDistance] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(null);
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

  // Hitung ulang ongkir setiap kali posisi peta berubah
  useEffect(() => {
    const [lat, lon] = mapPosition;
    // Hanya hitung jika user sudah memindahkan pin dari titik default Depot
    if (lat === DEPOT_LAT) {
      setDistance(null);
      setDeliveryFee(null);
      return;
    }
    const km = calculateDistance(lat, lon);
    const fee = calculateFare(km);
    setDistance(km);
    setDeliveryFee(fee);
  }, [mapPosition]);

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

    if (!mapPosition || mapPosition[0] === 0.5333) {
      setError("Harap pilih lokasi penjemputan di peta terlebih dahulu.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post("/pickups", {
        waste_type: wasteType,
        estimated_weight: Number(weightEstimate),
        address: address + (notes ? ` (Catatan: ${notes})` : ''),
        latitude: mapPosition[0],
        longitude: mapPosition[1],
        pickup_date: new Date().toISOString().split('T')[0],
        // Dikirim sebagai display value — backend WAJIB hitung ulang dari koordinat
        distance_km: distance,
        delivery_fee: deliveryFee,
        driver_fee: deliveryFee, // sementara sama; pisahkan saat skema komisi diimplementasi
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
                    placeholder="Masukkan alamat lengkap atau pilih di peta..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  <p className="pkp-input-subtitle">Alamat akan otomatis terisi saat memilih di peta</p>
                </div>
              </div>
            </div>

            {/* MAP VIEW */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <input 
                  type="text" 
                  placeholder="Cari jalan / daerah..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.75rem 1rem", outline: "none", fontSize: "0.9rem" }}
                  onKeyPress={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!searchQuery.trim()) return;
                      setIsSearching(true);
                      try {
                        const finalQuery = searchQuery.toLowerCase().includes('pekanbaru') ? searchQuery : `${searchQuery}, Pekanbaru`;
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&countrycodes=id&limit=1`);
                        const data = await res.json();
                        if (data && data.length > 0) {
                          setMapPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                          setAddress(data[0].display_name);
                        } else {
                          alert("Lokasi tidak ditemukan!");
                        }
                      } catch (err) {
                        alert("Gagal mencari lokasi.");
                      } finally {
                        setIsSearching(false);
                      }
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!searchQuery.trim()) return;
                    setIsSearching(true);
                    try {
                      const finalQuery = searchQuery.toLowerCase().includes('pekanbaru') ? searchQuery : `${searchQuery}, Pekanbaru`;
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&countrycodes=id&limit=1`);
                      const data = await res.json();
                      if (data && data.length > 0) {
                        setMapPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                        setAddress(data[0].display_name);
                      } else {
                        alert("Lokasi tidak ditemukan!");
                      }
                    } catch (err) {
                      alert("Gagal mencari lokasi.");
                    } finally {
                      setIsSearching(false);
                    }
                  }}
                  style={{ background: "#16a34a", color: "white", border: "none", borderRadius: "10px", padding: "0 1.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  disabled={isSearching}
                >
                  <Search size={18} />
                  <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{isSearching ? "..." : "Cari"}</span>
                </button>
              </div>

              <div style={{ height: "250px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", position: "relative", zIndex: 1 }}>
                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapUpdater center={mapPosition} />
                  <MapPicker position={mapPosition} setPosition={setMapPosition} setAddress={setAddress} />
                </MapContainer>
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

            {/* Delivery Fee Card */}
            {distance !== null && deliveryFee !== null && (
              <div style={{ background: "#064e3b", borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "#86efac", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Jarak Penjemputan</span>
                  <span style={{ fontSize: "1rem", fontWeight: "700", color: "white" }}>🛵 {distance} KM</span>
                </div>
                <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.2)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", alignItems: "flex-end" }}>
                  <span style={{ fontSize: "0.7rem", color: "#86efac", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Biaya Ongkir</span>
                  <span style={{ fontSize: "1rem", fontWeight: "700", color: "#4ade80" }}>Rp {deliveryFee.toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}

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
