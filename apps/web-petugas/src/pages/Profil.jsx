import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/authService";
import { getAllPickups } from "../services/pickupService";
import {
  User, Mail, Shield, Edit3, Save, X,
  CheckCircle2, Truck, Clock, History,
  Camera, ShieldCheck, AlertCircle, LogOut
} from "lucide-react";

function Profil() {
  const [user, setUser] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedPic = localStorage.getItem("petugas_pic");
    if (savedPic) setProfilePic(savedPic);

    const loadData = async () => {
      try {
        const [profileRes, pickupsRes] = await Promise.all([
          getProfile(),
          getAllPickups().catch(() => ({ data: [] }))
        ]);
        setUser(profileRes.user);
        setNewName(profileRes.user.name);
        setPickups(pickupsRes.data || []);
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(stored);
        setNewName(stored.name || "");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(newName.trim());
      setUser({ ...user, name: newName.trim() });
      localStorage.setItem("user", JSON.stringify({ ...user, name: newName.trim() }));
      setEditing(false);
      showToast("Profil berhasil diperbarui!");
    } catch {
      showToast("Gagal menyimpan perubahan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
      localStorage.setItem("petugas_pic", reader.result);
      showToast("Foto profil diperbarui!");
    };
    reader.readAsDataURL(file);
  };

  const myPickups = pickups.filter(p => p.petugas_id === user?.id);
  const completedCount = myPickups.filter(p => p.status === "completed").length;
  const activeCount = myPickups.filter(p => ["accepted", "on_the_way"].includes(p.status)).length;
  const totalWeight = myPickups
    .filter(p => p.status === "completed")
    .reduce((s, p) => s + (parseFloat(p.actual_weight) || 0), 0);

  if (loading) {
    return (
      <>
        <Navbar title="Profil" hideActions={true} />
        <div className="page-body">
          <div className="empty-state" style={{ minHeight: 400 }}>
            <div className="spinner" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Profil Petugas" subtitle="Kelola informasi akun Anda" hideActions={true} />

      <div className="page-body">
        <div className="grid-2-asym">

          {/* Left: Profile Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Hero */}
            <div className="card" style={{ background: "linear-gradient(135deg, var(--brand), #0f4c2a)", color: "white", padding: "1.5rem", borderRadius: "16px", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 4px 12px rgba(15,76,42,0.2)", border: "none" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "white", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 900, overflow: "hidden" }}>
                  {profilePic
                    ? <img src={profilePic} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (user?.name?.charAt(0).toUpperCase() || "P")}
                </div>
                <label
                  htmlFor="photo-upload"
                  style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 24, height: 24, background: "white",
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--brand)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <Camera size={12} />
                </label>
                <input id="photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Petugas"}</h2>
                <p style={{ fontSize: "0.75rem", opacity: 0.85, margin: "2px 0 8px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: 700 }}>
                  <ShieldCheck size={12} /> Petugas Aktif
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)" }}>Statistik Saya</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[
                  { label: "Selesai", val: completedCount, icon: CheckCircle2, color: "var(--brand)", bg: "var(--success-light)" },
                  { label: "Aktif", val: activeCount, icon: Truck, color: "#2563eb", bg: "var(--info-light)" },
                  { label: "Total Berat", val: `${totalWeight.toFixed(1)} kg`, icon: History, color: "#d97706", bg: "var(--warning-light)" },
                  { label: "Total Order", val: myPickups.length, icon: Clock, color: "var(--text)", bg: "var(--surface-2)" },
                ].map(item => (
                  <div key={item.label} style={{
                    background: item.bg, borderRadius: "12px",
                    padding: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem"
                  }}>
                    <item.icon size={16} color={item.color} />
                    <div style={{ fontWeight: 900, fontSize: "1.1rem", color: item.color, lineHeight: 1 }}>{item.val}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Edit Form & Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Edit Profile */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>Informasi Akun</div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{ background: "transparent", border: "none", color: "var(--brand)", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center" }}><User size={14} style={{ marginRight: 6 }} />Nama</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>
                    {editing ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", width: 150, borderRadius: "6px", border: "1px solid var(--brand)", outline: "none" }}
                        autoFocus
                      />
                    ) : (
                      user?.name || "-"
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center" }}><Mail size={14} style={{ marginRight: 6 }} />Email</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>{user?.email || "-"}</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center" }}><Shield size={14} style={{ marginRight: 6 }} />Role</div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, background: "var(--success-light)", color: "var(--brand)", padding: "2px 8px", borderRadius: "12px", textTransform: "capitalize" }}>
                    {user?.role || "petugas"}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center" }}>ID Akun</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>#{user?.id}</div>
                </div>
              </div>

              {editing && (
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={15} />
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => { setEditing(false); setNewName(user?.name || ""); }}
                  >
                    <X size={15} /> Batal
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)" }}>Order Terakhir Saya</div>
              {myPickups.length === 0 ? (
                <div className="empty-state" style={{ minHeight: 120, padding: "1.5rem", border: "1px dashed var(--border)", borderRadius: "12px", background: "var(--bg-light)" }}>
                  <div style={{ background: "white", padding: "0.5rem", borderRadius: "50%", marginBottom: "0.75rem" }}><History size={20} color="#94a3b8" /></div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Belum ada order yang ditangani.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {myPickups.slice(0, 5).map(p => (
                    <div key={p.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.75rem", background: "var(--surface-2)",
                      borderRadius: "var(--radius-md)", border: "1px solid var(--border)"
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>#{p.id} — {p.waste_type || "Sampah"}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{p.address?.substring(0, 40)}...</div>
                      </div>
                      <span className={`badge badge-${p.status}`}
                        style={{ fontSize: "0.72rem" }}>
                        {p.status === "completed" ? "Selesai" : p.status === "on_the_way" ? "Di Jalan" : p.status === "accepted" ? "Diterima" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="card" style={{ background: "var(--primary-light)", border: "1px solid #bbf7d0" }}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <AlertCircle size={18} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--brand)", marginBottom: 4 }}>Tips Petugas</div>
                  <div style={{ fontSize: "0.83rem", color: "var(--brand)", lineHeight: 1.6, opacity: 0.85 }}>
                    Selalu timbang sampah secara akurat agar pengguna mendapatkan saldo yang sesuai. Pastikan status selalu diperbarui secara real-time.
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              className="btn btn-danger"
              style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", borderRadius: "12px", marginTop: "0.5rem" }}
              onClick={handleLogout}
            >
              <LogOut size={18} /> Keluar Akun
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default Profil;
