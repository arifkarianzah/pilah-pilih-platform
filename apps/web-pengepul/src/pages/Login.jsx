import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiLock, FiMail } from 'react-icons/fi';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      // Verifikasi role pengepul
      if (user.role !== 'pengepul' && user.role !== 'admin') {
        setError('Akses ditolak. Akun ini bukan milik Pengepul.');
        return;
      }
      
      // Simpan token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state app
      onLogin(user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa koneksi ke backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', background: 'var(--bg-color)'
    }}>
      <div className="glass-card" style={{width: '100%', maxWidth: 420, padding: 40}}>
        <div style={{textAlign: 'center', marginBottom: 32}}>
          <div style={{fontSize: 48, marginBottom: 16}}>♻️</div>
          <h2>Login Pengepul</h2>
          <p style={{color: 'var(--text-muted)'}}>Silakan masuk untuk mengelola dashboard Anda</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', 
            padding: 12, borderRadius: 8, marginBottom: 24, fontSize: 14, textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <div style={{position: 'relative'}}>
              <FiMail style={{position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)'}} />
              <input 
                type="email" 
                className="input-control" 
                style={{paddingLeft: 40}}
                placeholder="email@pengepul.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div style={{position: 'relative'}}>
              <FiLock style={{position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)'}} />
              <input 
                type="password" 
                className="input-control" 
                style={{paddingLeft: 40}}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-success" 
            style={{width: '100%', justifyContent: 'center', marginTop: 16, padding: '14px'}}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
            Belum punya akun? <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 600 }}>Daftar Pengepul Baru</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
