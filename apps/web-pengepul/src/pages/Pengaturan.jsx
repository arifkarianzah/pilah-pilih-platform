import { useState } from 'react';
import { FiLock, FiBell, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import { changePassword } from '../api/pengepulAPI';
import PageHeader from '../components/UI/PageHeader';
import { toast } from '../components/UI/Toast';

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    kiriman_baru: true,
    stok_menipis: true,
    penjualan_berhasil: true,
    pengumuman: false,
  });

  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('Password baru dan konfirmasi tidak cocok!');
      return;
    }
    if (pwForm.new_password.length < 6) {
      toast.error('Password baru minimal 6 karakter!');
      return;
    }
    setLoading(true);
    try {
      await changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      toast.success('Password berhasil diubah!');
      setPwForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengubah password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'password', label: 'Ubah Password', icon: <FiLock /> },
    { key: 'notifikasi', label: 'Notifikasi', icon: <FiBell /> },
    { key: 'keamanan', label: 'Keamanan', icon: <FiShield /> },
  ];

  const PasswordInput = ({ name, label, show, onToggle }) => (
    <div className="input-group">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          name={name}
          required
          className="input-control"
          value={pwForm[name]}
          onChange={handlePwChange}
          placeholder="••••••••"
          style={{ paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
          }}
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <PageHeader title="Pengaturan" subtitle="Kelola keamanan dan konfigurasi akun" />

      {/* Tabs */}
      <div className="tabs mb-24">
        {tabs.map(t => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Password */}
      {activeTab === 'password' && (
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><FiLock /> Ubah Password</div>
          </div>
          <div style={{
            background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13,
            color: 'var(--text-muted)', lineHeight: 1.6
          }}>
            💡 Tips: Gunakan password minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol.
          </div>
          <form onSubmit={handleChangePassword}>
            <PasswordInput name="old_password" label="Password Lama" show={showOld} onToggle={() => setShowOld(!showOld)} />
            <PasswordInput name="new_password" label="Password Baru" show={showNew} onToggle={() => setShowNew(!showNew)} />
            <PasswordInput name="confirm_password" label="Konfirmasi Password Baru" show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />

            {/* Strength Indicator */}
            {pwForm.new_password && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Kekuatan Password</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4].map(i => {
                    const len = pwForm.new_password.length;
                    const strength = len >= 12 ? 4 : len >= 8 ? 3 : len >= 6 ? 2 : 1;
                    const colors = ['', 'var(--danger)', 'var(--warning)', 'var(--info)', 'var(--success)'];
                    return (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 4,
                        background: i <= strength ? colors[strength] : 'var(--border)',
                        transition: 'background 0.3s',
                      }} />
                    );
                  })}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FiLock /> {loading ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Notifikasi */}
      {activeTab === 'notifikasi' && (
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><FiBell /> Pengaturan Notifikasi</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { key: 'kiriman_baru', label: 'Kiriman Baru', desc: 'Notifikasi saat ada kiriman sampah baru dari petugas', icon: '📦' },
              { key: 'stok_menipis', label: 'Stok Menipis', desc: 'Peringatan saat stok sampah di bawah minimum', icon: '⚠️' },
              { key: 'penjualan_berhasil', label: 'Penjualan Berhasil', desc: 'Konfirmasi saat transaksi penjualan ke pabrik selesai', icon: '🏭' },
              { key: 'pengumuman', label: 'Pengumuman Admin', desc: 'Pengumuman dan info dari admin sistem', icon: '📢' },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.desc}</div>
                </div>
                <label style={{ position: 'relative', width: 44, height: 24, flexShrink: 0, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifSettings[item.key]}
                    onChange={() => {
                      setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }));
                      toast.info('Pengaturan notifikasi diperbarui');
                    }}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 12,
                    background: notifSettings[item.key] ? 'var(--primary)' : 'var(--surface-light)',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2,
                      left: notifSettings[item.key] ? 22 : 2,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Keamanan */}
      {activeTab === 'keamanan' && (
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><FiShield /> Keamanan Akun</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Status Akun', value: '✅ Aktif & Terverifikasi', color: 'var(--success)' },
              { label: 'Role / Peran', value: '♻️ Pengepul', color: 'var(--primary)' },
              { label: 'Last Login', value: new Date().toLocaleString('id-ID'), color: 'var(--text-main)' },
              { label: 'Sesi Aktif', value: '1 Perangkat', color: 'var(--text-main)' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: item.color, fontSize: 13 }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: '16px', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--danger)' }}>⚠️ Zona Berbahaya</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Aksi di bawah ini bersifat permanen dan tidak dapat dibatalkan.
            </p>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (confirm('Yakin ingin logout dari semua perangkat?')) {
                  localStorage.clear();
                  window.location.href = '/login';
                }
              }}
            >
              🔓 Logout dari Semua Perangkat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengaturan;
