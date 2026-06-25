import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getProfile, updateProfile } from "../services/authService";
import { getAllPickups } from "../services/pickupService";
import {
  User, Mail, Shield, Edit3, Save, X,
  CheckCircle2, Truck, Clock, History,
  Camera, ShieldCheck, AlertCircle
} from "lucide-react";

function Profil() {
  const [user, setUser] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
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
            <div className="profile-hero">
              <div style={{ position: "relative" }}>
                <div className="profile-avatar-lg">
                  {profilePic
                    ? <img src={profilePic} alt="Profil" />
                    : (user?.name?.charAt(0).toUpperCase() || "P")}
                </div>
                <label
                  htmlFor="photo-upload"
                  style={{
                    position: "absolute", bottom: -4, right: -4,
                    width: 28, height: 28, background: "var(--primary)",
                    borderRadius: "50%", border: "2px solid white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "white"
                  }}
                >
                  <Camera size={13} />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
              </div>
              <div className="profile-info">
                <h2>{user?.name || "Petugas"}</h2>
                <p>{user?.email}</p>
                <div className="profile-role-badge">
                  <ShieldCheck size={12} /> Petugas Aktif
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: "1rem" }}>Statistik Saya</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[
                  { label: "Selesai", val: completedCount, icon: CheckCircle2, color: "var(--brand)", bg: "var(--success-light)" },
                  { label: "Aktif", val: activeCount, icon: Truck, color: "#2563eb", bg: "var(--info-light)" },
                  { label: "Total Berat", val: `${totalWeight.toFixed(1)} kg`, icon: History, color: "#d97706", bg: "var(--warning-light)" },
                  { label: "Total Order", val: myPickups.length, icon: Clock, color: "var(--text)", bg: "var(--surface-2)" },
                ].map(item => (
                  <div key={item.label} style={{
                    background: item.bg, borderRadius: "var(--radius-md)",
                    padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"
                  }}>
                    <item.icon size={20} color={item.color} />
                    <div style={{ fontWeight: 900, fontSize: "1.3rem", color: item.color, lineHeight: 1 }}>{item.val}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Edit Form & Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Edit Profile */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Informasi Akun</div>
                {!editing && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                )}
              </div>

              <div className="info-row">
                <div className="info-label"><User size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Nama</div>
                <div className="info-value">
                  {editing ? (
                    <input
                      type="text"
                      className="form-input"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.88rem", width: 200 }}
                      autoFocus
                    />
                  ) : (
                    user?.name || "-"
                  )}
                </div>
              </div>

              <div className="info-row">
                <div className="info-label"><Mail size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Email</div>
                <div className="info-value" style={{ color: "var(--text-muted)" }}>{user?.email || "-"}</div>
              </div>

              <div className="info-row">
                <div className="info-label"><Shield size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Role</div>
                <div className="info-value">
                  <span className="badge badge-completed" style={{ textTransform: "capitalize" }}>
                    {user?.role || "petugas"}
                  </span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-label">ID Akun</div>
                <div className="info-value" style={{ color: "var(--text-muted)" }}>#{user?.id}</div>
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
            <div className="card">
              <div className="card-title" style={{ marginBottom: "1rem" }}>Order Terakhir Saya</div>
              {myPickups.length === 0 ? (
                <div className="empty-state" style={{ minHeight: 120 }}>
                  <div className="empty-state-icon"><History size={24} /></div>
                  <p>Belum ada order yang ditangani.</p>
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
