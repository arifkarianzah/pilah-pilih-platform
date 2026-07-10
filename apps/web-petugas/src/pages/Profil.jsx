import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, changePassword, updateStatus } from "../services/authService";
import { getAllPickups } from "../services/pickupService";
import {
  User, Mail, Shield, Edit3, Save, X,
  CheckCircle2, Truck, Clock, History,
  Camera, ShieldCheck, AlertCircle, LogOut, Key, ChevronRight
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
  const [availability, setAvailability] = useState("OFFLINE");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  /* ── Toast ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Load data (logika tidak diubah) ── */
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
        setAvailability(profileRes.user.availability_status || localStorage.getItem("availability_status") || "OFFLINE");
        setPickups(pickupsRes.data || []);

        if (profileRes.user.must_change_password) {
          setShowPasswordModal(true);
        }
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

  /* ── Handlers (semua logika tidak diubah) ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.oldPassword || !pwdForm.newPassword) return;
    setPwdLoading(true);
    try {
      await changePassword(pwdForm.oldPassword, pwdForm.newPassword);
      showToast("Password berhasil diubah!");
      setShowPasswordModal(false);
      setPwdForm({ oldPassword: "", newPassword: "" });
      setUser(u => ({ ...u, must_change_password: 0 }));
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mengubah password", "error");
    } finally {
      setPwdLoading(false);
    }
  };

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

  /* ── Stats ── */
  const myPickups = pickups.filter(p => p.petugas_id === user?.id);
  const completedCount = myPickups.filter(p => p.status === "completed").length;
  const activeCount = myPickups.filter(p => ["accepted", "on_the_way"].includes(p.status)).length;
  const totalWeight = myPickups
    .filter(p => p.status === "completed")
    .reduce((s, p) => s + (parseFloat(p.actual_weight) || 0), 0);

  /* ── Status display (read-only sesuai permintaan) ── */
  const statusLabel = availability === "AVAILABLE" ? "ONLINE" : availability === "BUSY" ? "SIBUK" : "OFFLINE";
  const statusClass = availability === "AVAILABLE" ? "online" : availability === "BUSY" ? "busy" : "offline";

  if (loading) {
    return (
      <>
        <Navbar title="Profil" hideActions={true} />
        <div className="page-body">
          <div className="loading-screen" style={{ minHeight: 400 }}>
            <div className="spinner" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Profil Petugas" hideActions={true} />

      <div style={{ paddingBottom: "calc(var(--nav-h) + 1rem)" }}>

        {/* ── HERO SECTION ── */}
        <div className="profile-hero" style={{ margin: "0 0 0", borderRadius: 0, paddingTop: "2rem", paddingBottom: "2.5rem" }}>
          {/* Avatar */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
            <div className="profile-avatar-lg">
              {profilePic
                ? <img src={profilePic} alt="Foto Profil" />
                : (user?.name?.charAt(0).toUpperCase() || "P")}
            </div>
            <label
              htmlFor="photo-upload"
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 28, height: 28, background: "white",
                borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", color: "var(--brand)",
                boxShadow: "var(--shadow-md)", border: "2px solid white"
              }}
              aria-label="Ubah foto profil"
            >
              <Camera size={14} />
            </label>
            <input id="photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </div>

          {/* Name & Email */}
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "white", margin: "0 0 4px", position: "relative", zIndex: 2 }}>
            {user?.name || "Petugas"}
          </h2>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", margin: "0 0 0.85rem", position: "relative", zIndex: 2 }}>
            {user?.email}
          </p>

          {/* Status badge (read-only) */}
          <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
            <span className={`status-pill ${statusClass}`}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {statusLabel}
            </span>
            <span className="profile-role-badge">
              <ShieldCheck size={12} /> Petugas
            </span>
          </div>
        </div>

        <div style={{ padding: "0 1.25rem", marginTop: "-1rem", position: "relative", zIndex: 2 }}>

          {/* ── STAT CARDS ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.65rem",
            marginBottom: "1rem"
          }}>
            {[
              { label: "Order Selesai", val: completedCount, icon: CheckCircle2, color: "var(--brand)", bg: "var(--success-light)" },
              { label: "Order Aktif",   val: activeCount,    icon: Truck,         color: "var(--info)",  bg: "var(--info-light)" },
              { label: "Total Berat",   val: `${totalWeight.toFixed(1)} kg`, icon: History, color: "var(--warning)", bg: "var(--warning-light)" },
              { label: "Total Order",   val: myPickups.length, icon: Clock,       color: "var(--text-muted)", bg: "var(--surface-2)" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{
                  background: "white", borderRadius: "var(--radius-xl)",
                  padding: "0.85rem", border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex", alignItems: "center", gap: "0.75rem"
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "var(--radius-md)",
                    background: item.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0
                  }}>
                    <Icon size={18} color={item.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: "1rem", color: "var(--text)", lineHeight: 1 }}>{item.val}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, marginTop: 3 }}>{item.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── INFORMASI AKUN ── */}
          <div className="card" style={{ marginBottom: "0.85rem", padding: "1.15rem" }}>
            <div className="card-header">
              <span className="card-title">Informasi Akun</span>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{ background: "none", border: "none", color: "var(--brand)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Edit3 size={13} /> Edit
                </button>
              )}
            </div>

            <div className="info-row">
              <div className="info-label"><User size={13} /> Nama</div>
              <div className="info-value">
                {editing ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    style={{
                      padding: "0.3rem 0.6rem", fontSize: "0.82rem", width: 160,
                      borderRadius: "var(--radius-sm)", border: "1.5px solid var(--brand)",
                      outline: "none", fontFamily: "inherit", fontWeight: 700
                    }}
                    autoFocus
                  />
                ) : (user?.name || "-")}
              </div>
            </div>

            <div className="info-row">
              <div className="info-label"><Mail size={13} /> Email</div>
              <div className="info-value" style={{ color: "var(--text-muted)" }}>{user?.email || "-"}</div>
            </div>

            <div className="info-row">
              <div className="info-label"><Shield size={13} /> Role</div>
              <div className="info-value">
                <span style={{
                  background: "var(--success-light)", color: "var(--brand)",
                  fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px",
                  borderRadius: "var(--radius-full)", textTransform: "capitalize"
                }}>
                  {user?.role || "petugas"}
                </span>
              </div>
            </div>

            <div className="info-row" style={{ borderBottom: "none" }}>
              <div className="info-label">ID Akun</div>
              <div className="info-value" style={{ color: "var(--text-muted)" }}>#{user?.id}</div>
            </div>

            {editing && (
              <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  <Save size={13} /> {saving ? "Menyimpan..." : "Simpan"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setNewName(user?.name || ""); }}>
                  <X size={13} /> Batal
                </button>
              </div>
            )}
          </div>

          {/* ── ORDER TERAKHIR ── */}
          {myPickups.length > 0 && (
            <div className="card" style={{ marginBottom: "0.85rem", padding: "1.15rem" }}>
              <div className="card-header">
                <span className="card-title">Order Terakhir</span>
                <span className="section-link" onClick={() => navigate("/riwayat")}>Semua <ChevronRight size={13} /></span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {myPickups.slice(0, 3).map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/orders/${p.id}`)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.7rem 0.85rem", background: "var(--bg)",
                      borderRadius: "var(--radius-md)", cursor: "pointer",
                      border: "1px solid rgba(0,0,0,0.04)", transition: "all 0.2s"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "var(--primary-light)"}
                    onMouseOut={e => e.currentTarget.style.background = "var(--bg)"}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>#{p.id} — {p.waste_type || "Sampah"}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 1 }}>
                        {(p.address || "").substring(0, 38)}{p.address?.length > 38 ? "..." : ""}
                      </div>
                    </div>
                    <span className={`badge badge-${p.status}`} style={{ fontSize: "0.62rem" }}>
                      {p.status === "completed" ? "Selesai" : p.status === "on_the_way" ? "Di Jalan" : p.status === "accepted" ? "Diterima" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TIPS ── */}
          <div className="card" style={{ background: "var(--primary-light)", border: "1px solid #bbf7d0", marginBottom: "0.85rem", padding: "1rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <AlertCircle size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: "var(--brand)", marginBottom: 3, fontSize: "0.82rem" }}>Tips Petugas</div>
                <div style={{ fontSize: "0.75rem", color: "var(--brand)", lineHeight: 1.6, opacity: 0.85 }}>
                  Selalu timbang sampah secara akurat & perbarui status secara real-time agar pengguna mendapat saldo yang sesuai.
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "0.85rem" }}>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-outline btn-full"
              style={{ justifyContent: "flex-start", gap: "0.75rem", borderRadius: "var(--radius-lg)", padding: "0.85rem 1.15rem" }}
            >
              <Key size={17} /> Ubah Password
            </button>

            <button
              className="btn btn-danger btn-full"
              onClick={handleLogout}
              style={{ justifyContent: "flex-start", gap: "0.75rem", borderRadius: "var(--radius-lg)", padding: "0.85rem 1.15rem" }}
            >
              <LogOut size={17} /> Keluar Akun
            </button>
          </div>

        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Password Modal ── */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-scale-in">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{
                width: 44, height: 44, background: "var(--primary-light)", borderRadius: "var(--radius-lg)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", flexShrink: 0
              }}>
                <Key size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Ubah Password</h3>
                {user?.must_change_password ? (
                  <p style={{ fontSize: "0.72rem", color: "var(--warning)", fontWeight: 600, margin: "2px 0 0" }}>
                    Password sementara — harap ubah sekarang.
                  </p>
                ) : (
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "2px 0 0", fontWeight: 500 }}>
                    Masukkan password lama dan password baru.
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label className="form-label" style={{ fontSize: "0.8rem" }}>Password Lama</label>
                <input
                  type="password"
                  className="form-input"
                  value={pwdForm.oldPassword}
                  onChange={e => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "0.8rem" }}>Password Baru</label>
                <input
                  type="password"
                  className="form-input"
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Min. 6 karakter"
                />
              </div>
              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.25rem" }}>
                {!user?.must_change_password && (
                  <button type="button" className="btn btn-ghost" onClick={() => setShowPasswordModal(false)} style={{ flex: 1 }}>
                    Batal
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={pwdLoading} style={{ flex: 1 }}>
                  {pwdLoading ? "Menyimpan..." : "Simpan Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Profil;
