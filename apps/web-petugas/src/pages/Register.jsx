import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerPetugas } from "../services/authService";
import {
  Recycle, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle2, ShieldCheck, Truck, ArrowLeft
} from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerPetugas(name.trim(), email.trim(), password);
      if (data.success) {
        setSuccess("Akun petugas berhasil dibuat! Mengarahkan ke halaman login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Registrasi gagal.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { level: 1, label: "Terlalu pendek", color: "#ef4444" };
    if (password.length < 8) return { level: 2, label: "Lemah", color: "#f59e0b" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, label: "Kuat", color: "#22c55e" };
    return { level: 3, label: "Cukup", color: "#3b82f6" };
  };
  const strength = passwordStrength();

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Recycle size={30} />
          </div>
          <div className="login-brand-text">
            <strong>Pilah Pilih</strong>
            <span>Petugas Dashboard</span>
          </div>
        </div>

        <div className="login-hero-text">
          <h2>Bergabung Sebagai Petugas Lapangan</h2>
          <p>
            Daftarkan diri sebagai petugas untuk mulai mengelola order
            penjemputan sampah dan berkontribusi pada lingkungan yang lebih bersih.
          </p>

          <div className="login-stats">
            <div className="login-stat">
              <strong>
                <ShieldCheck size={20} style={{ margin: "0 auto 4px", display: "block" }} />
              </strong>
              <span>Akun Terverifikasi</span>
            </div>
            <div className="login-stat">
              <strong>
                <Truck size={20} style={{ margin: "0 auto 4px", display: "block" }} />
              </strong>
              <span>Kelola Order</span>
            </div>
            <div className="login-stat">
              <strong>
                <CheckCircle2 size={20} style={{ margin: "0 auto 4px", display: "block" }} />
              </strong>
              <span>Mudah & Cepat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right">
        <div className="login-form-box">
          <div style={{ marginBottom: "2rem" }}>
            <div style={{
              width: 52, height: 52, background: "var(--primary-light)",
              borderRadius: "var(--radius-lg)", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "var(--brand)", marginBottom: "1.25rem"
            }}>
              <User size={26} />
            </div>
            <h1>Daftar Akun Petugas</h1>
            <p>Isi data di bawah untuk membuat akun petugas baru.</p>
          </div>

          <form onSubmit={handleRegister} className="form-stack">

            {/* Error */}
            {error && (
              <div className="login-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                background: "var(--success-light)", color: "var(--brand)",
                padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
                fontWeight: 600, fontSize: "0.85rem",
                border: "1px solid #86efac",
                display: "flex", alignItems: "center", gap: "0.5rem"
              }}>
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            {/* Nama */}
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <div className="input-with-icon">
                <span className="input-icon"><User size={16} /></span>
                <input
                  id="name-input"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <span className="input-icon"><Mail size={16} /></span>
                <input
                  id="email-input"
                  type="email"
                  className="form-input"
                  placeholder="petugas@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  id="password-input"
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength bar */}
              {strength && (
                <div style={{ marginTop: "0.4rem" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 4,
                        background: i <= strength.level ? strength.color : "var(--border)",
                        transition: "background 0.3s"
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Konfirmasi Password</label>
              <div className="input-with-icon">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  id="confirm-password-input"
                  type={showConfirm ? "text" : "password"}
                  className="form-input"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{
                    borderColor: confirmPassword
                      ? password === confirmPassword ? "#22c55e" : "#ef4444"
                      : undefined
                  }}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 600 }}>
                  Password tidak cocok
                </span>
              )}
              {confirmPassword && password === confirmPassword && (
                <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>
                  ✓ Password cocok
                </span>
              )}
            </div>

            <button
              id="register-btn"
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading || !!success}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Mendaftarkan...
                </span>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          {/* Link ke Login */}
          <div style={{
            marginTop: "1.75rem", textAlign: "center",
            fontSize: "0.88rem", color: "var(--text-muted)"
          }}>
            Sudah punya akun?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--brand)", fontWeight: 700,
                textDecoration: "none"
              }}
            >
              <ArrowLeft size={13} style={{ verticalAlign: -2, marginRight: 3 }} />
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
