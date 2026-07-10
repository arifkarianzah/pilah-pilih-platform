import { useState } from 'react';
import { registerPetugas } from '../api/pengepulAPI';
import { toast } from '../components/UI/Toast';

const TambahPetugas = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Semua kolom wajib diisi');
    }
    if (formData.password.length < 6) {
      return toast.error('Password minimal 6 karakter');
    }

    setLoading(true);
    try {
      const res = await registerPetugas(formData);
      if (res.data.success) {
        toast.success('Petugas berhasil didaftarkan');
        setFormData({ name: '', email: '', password: '' });
      } else {
        toast.error(res.data.message || 'Gagal mendaftarkan petugas');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tambah Petugas</h1>
        <p className="page-subtitle">Daftarkan akun petugas baru untuk sistem penjemputan sampah.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Form Pendaftaran Petugas</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap petugas"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="petugas@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Mendaftarkan...' : 'Daftarkan Petugas'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TambahPetugas;
