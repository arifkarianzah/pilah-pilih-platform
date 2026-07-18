import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { Recycle, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ── Logika login tetap sama ── */
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
      {/* Decorative floating orbs */}
      <div style={{
        position: "absolute", top: 80, left: "10%", width: 120, height: 120,
        background: "rgba(22,163,74,0.08)", borderRadius: "50%",
        animation: "floatUp 4s ease-in-out infinite", zIndex: 0
      }} />
      <div style={{
        position: "absolute", bottom: 100, right: "8%", width: 80, height: 80,
        background: "rgba(34,197,94,0.1)", borderRadius: "50%",
        animation: "floatUp 5s ease-in-out infinite 1s", zIndex: 0
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "15%", width: 50, height: 50,
        background: "rgba(16,185,129,0.07)", borderRadius: "50%",
        animation: "floatUp 3.5s ease-in-out infinite 0.5s", zIndex: 0
      }} />

      <div className="login-card animate-scale-in">
        {/* Logo + Title — horizontal, sebelah kiri */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.85rem",
          marginBottom: "2rem"
        }}>
          <div className="login-logo" style={{ margin: 0 }}>
            <Recycle size={30} strokeWidth={2} />
          </div>
          <div>
            <h1 style={{
              fontSize: "1.35rem", fontWeight: 900, color: "var(--text)",
              letterSpacing: "-0.5px", margin: 0, lineHeight: 1.1
            }}>PILAH PILIH</h1>
            <p style={{
              fontSize: "0.75rem", color: "var(--text-muted)",
              fontWeight: 500, margin: "3px 0 0"
            }}>Portal Petugas Bank Sampah</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="form-stack">
          {error && (
            <div className="login-error animate-fade-in">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email</label>
            <div className="input-with-icon">
              <span className="input-icon"><Mail size={16} /></span>
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="petugas@banksamph.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
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
                aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
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
            style={{ marginTop: "0.5rem" }}
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

        {/* Footer */}
        <p style={{
          textAlign: "center", marginTop: "1.5rem",
          fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500
        }}>
          Hanya untuk akun petugas yang terdaftar
        </p>
      </div>
    </div>
  );
}

export default Login;
