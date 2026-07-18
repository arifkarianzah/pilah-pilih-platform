import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiLock, FiMail, FiUser, FiPhone, FiHome, FiBriefcase } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company_name: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axiosInstance.post('/auth/register-pengepul', formData);
      setSuccess(response.data.message || 'Pendaftaran berhasil!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Periksa koneksi ke backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem'
    }}>
      <div className="glass-card" style={{width: '100%', maxWidth: 500, padding: 40}}>
        <div style={{textAlign: 'center', marginBottom: 32}}>
          <div style={{fontSize: 48, marginBottom: 16}}>🏭</div>
          <h2>Daftar Pengepul Baru</h2>
          <p style={{color: 'var(--text-muted)'}}>Mari bergabung menjadi mitra pengepul Pilah Pilih</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', 
            padding: 12, borderRadius: 8, marginBottom: 24, fontSize: 14, textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', 
            padding: 12, borderRadius: 8, marginBottom: 24, fontSize: 14, textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nama Lengkap</label>
            <div style={{position: 'relative'}}>
              <FiUser style={{position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)'}} />
              <input 
                type="text" name="name" className="input-control" style={{paddingLeft: 40}}
                placeholder="Nama Anda" value={formData.name} onChange={handleChange} required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
            <div style={{position: 'relative'}}>
              <FiMail style={{position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)'}} />
              <input 
                type="email" name="email" className="input-control" style={{paddingLeft: 40}}
                placeholder="email@pengepul.com" value={formData.email} onChange={handleChange} required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Nama Lapak / Perusahaan</label>
              <div style={{position: 'relative'}}>
                <FiBriefcase style={{position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)'}} />
                <input 
                  type="text" name="company_name" className="input-control" style={{paddingLeft: 40}}
                  placeholder="Contoh: UD Maju Jaya" value={formData.company_name} onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>No WhatsApp</label>
              <div style={{position: 'relative'}}>
                <FiPhone style={{position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)'}} />
                <input 
                  type="text" name="phone" className="input-control" style={{paddingLeft: 40}}
                  placeholder="081234..." value={formData.phone} onChange={handleChange} required
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Alamat Lengkap</label>
            <div style={{position: 'relative'}}>
              <FiHome style={{position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)'}} />
              <input 
                type="text" name="address" className="input-control" style={{paddingLeft: 40}}
                placeholder="Jalan, RT/RW, Kelurahan..." value={formData.address} onChange={handleChange} required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{position: 'relative'}}>
              <FiLock style={{position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)'}} />
              <input 
                type="password" name="password" className="input-control" style={{paddingLeft: 40}}
                placeholder="Minimal 6 karakter" value={formData.password} onChange={handleChange} required minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-success" 
            style={{width: '100%', justifyContent: 'center', marginTop: 16, padding: '14px'}}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
            Sudah punya akun? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Login di sini</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
