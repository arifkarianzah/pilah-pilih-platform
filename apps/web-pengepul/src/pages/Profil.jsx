import { useState, useEffect } from 'react';
import { FiUser, FiSave, FiCamera } from 'react-icons/fi';
import { updateProfile } from '../api/pengepulAPI';
import PageHeader from '../components/UI/PageHeader';
import { toast } from '../components/UI/Toast';

const Profil = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    company_name: '',
    address: '',
    phone: '',
    npwp: '',
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profil');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile({
      name: storedUser.name || '',
      email: storedUser.email || '',
      company_name: storedUser.company_name || 'UD. Rongsok Jaya Abadi',
      address: storedUser.address || 'Jl. Merdeka No. 45, Jakarta',
      phone: storedUser.phone || '',
      npwp: storedUser.npwp || '',
    });
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profile);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...profile }));
      toast.success('Profil berhasil diperbarui!');
    } catch {
      toast.warning('Perubahan disimpan secara lokal (mode offline).');
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...profile }));
    } finally {
      setLoading(false);
    }
  };

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'P';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <PageHeader title="Profil Pengepul" subtitle="Kelola informasi perusahaan dan akun Anda" />

      {/* Avatar Section */}
      <div className="glass-card mb-24" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 84, height: 84, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, fontWeight: 800, color: '#fff',
            boxShadow: 'var(--shadow-glow)',
          }}>
            {initial}
          </div>
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--primary)', border: '2px solid var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 12,
          }}>
            <FiCamera style={{ color: '#fff' }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{profile.name || 'Admin Pengepul'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{profile.email}</div>
          <div style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            {profile.company_name}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="badge completed">● Aktif</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-24">
        <button className={`tab-btn ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>
          <FiUser /> Data Perusahaan
        </button>
      </div>

      {/* Form */}
      <div className="glass-card">
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="input-group">
              <label>Nama Penanggung Jawab *</label>
              <input type="text" name="name" required className="input-control" value={profile.name} onChange={handleChange} placeholder="Nama lengkap..." />
            </div>
            <div className="input-group">
              <label>Email Login</label>
              <input type="email" className="input-control" value={profile.email} disabled style={{ opacity: 0.6 }} />
            </div>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>Nama Perusahaan / Lapak</label>
              <input type="text" name="company_name" className="input-control" value={profile.company_name} onChange={handleChange} placeholder="Nama perusahaan..." />
            </div>
            <div className="input-group">
              <label>No HP / WhatsApp *</label>
              <input type="text" name="phone" className="input-control" value={profile.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" />
            </div>
          </div>

          <div className="input-group">
            <label>Alamat Lengkap</label>
            <textarea name="address" rows={3} className="input-control" value={profile.address} onChange={handleChange} placeholder="Jalan, Kelurahan, Kecamatan, Kota..." />
          </div>

          <div className="input-group">
            <label>NPWP (Opsional)</label>
            <input type="text" name="npwp" className="input-control" value={profile.npwp} onChange={handleChange} placeholder="XX.XXX.XXX.X-XXX.XXX" />
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FiSave /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profil;
