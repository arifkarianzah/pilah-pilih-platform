import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { Recycle, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Truck, BarChart3 } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        if (data.user.role !== "petugas" && data.user.role !== "admin") {
          setError("Akun ini bukan akun petugas. Silakan gunakan akun petugas.");
          setLoading(false);
          return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || "Login gagal");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Kelola Penjemputan Sampah dengan Mudah</h2>
          <p>
            Platform terintegrasi untuk petugas lapangan mengelola order,
            menimbang sampah, dan memperbarui status penjemputan secara real-time.
          </p>

          <div className="login-stats">
            <div className="login-stat">
              <strong>
                <Truck size={20} style={{ margin: "0 auto 4px", display: "block" }} />
              </strong>
              <span>Terima Order</span>
            </div>
            <div className="login-stat">
              <strong>
                <ShieldCheck size={20} style={{ margin: "0 auto 4px", display: "block" }} />
              </strong>
              <span>Update Status</span>
            </div>
            <div className="login-stat">
              <strong>
                <BarChart3 size={20} style={{ margin: "0 auto 4px", display: "block" }} />
              </strong>
              <span>Lihat Riwayat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-form-box">
          <div style={{ marginBottom: "2rem" }}>
            <div style={{
              width: 52, height: 52, background: "var(--primary-light)",
              borderRadius: "var(--radius-lg)", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "var(--brand)", marginBottom: "1.25rem"
            }}>
              <ShieldCheck size={26} />
            </div>
            <h1>Masuk ke Dashboard</h1>
            <p>Hanya untuk akun petugas yang terdaftar.</p>
          </div>

          <form onSubmit={handleLogin} className="form-stack">
            {error && (
              <div className="login-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  id="password-input"
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Masuk...
                </span>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          {/* Registration link removed since only Pengepul can create Petugas accounts */}
        </div>
      </div>
    </div>
  );
}

export default Login;
