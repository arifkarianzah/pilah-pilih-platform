import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { User, Mail, Lock, Phone, MapPin, Leaf, AlertCircle } from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
        address
      });

      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "500px" }}>
        <div className="auth-header">
          <div className="auth-logo-icon">
            <Leaf size={32} />
          </div>
          <h1>Daftar Pilah Pilih</h1>
          <p>Buat akun baru untuk mulai berkontribusi pada lingkungan</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nama Lengkap</label>
            <div className="input-with-icon">
              <User className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>No. HP</label>
            <div className="input-with-icon">
              <Phone className="input-icon" size={20} />
              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Alamat Lengkap</label>
            <div className="input-with-icon">
              <MapPin className="input-icon" size={20} style={{ top: 16 }} />
              <textarea
                placeholder="Masukkan detail alamat untuk penjemputan sampah"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="3"
              ></textarea>
            </div>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Buat Akun Baru"}
          </button>
        </form>
        
        <div className="auth-footer">
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
