import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

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
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card" style={{ maxWidth: "500px" }}>
        <div className="auth-header">
          <h1>Daftar Pilah Pilih</h1>
          <p>Buat akun baru untuk mulai berkontribusi pada lingkungan</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nama Lengkap</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>No. HP</label>
            <input
              type="text"
              placeholder="Masukkan nomor handphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Alamat Lengkap</label>
            <textarea
              placeholder="Masukkan alamat lengkap untuk penjemputan"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="3"
            ></textarea>
          </div>

          <button type="submit">Daftar</button>
        </form>
        
        <div className="auth-footer">
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
