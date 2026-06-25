import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form.email, form.password);
      if (res.success) {
        if (res.user.role !== 'admin') {
          setError('Akun Anda bukan admin. Akses ditolak.');
          setLoading(false);
          return;
        }
        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminUser', JSON.stringify(res.user));
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email & password.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f4c2a 0%, #196b3a 50%, #22c55e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-80px', left: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 72, height: 72, background: 'var(--brand)', borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(15,76,42,0.3)',
          }}>♻️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Pilah Pilih Admin
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Masuk ke panel administrasi
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--danger-light)', color: '#991b1b', padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '1rem', border: '1px solid #fecaca',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Admin</label>
            <input
              className="form-control"
              type="email"
              id="admin-email"
              placeholder="admin@pilahpilih.id"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              id="admin-password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            id="admin-login-btn"
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Masuk...</> : '🔐 Masuk sebagai Admin'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '1.5rem' }}>
          Pilah Pilih Admin Panel v1.0
        </p>
      </div>
    </div>
  );
}
