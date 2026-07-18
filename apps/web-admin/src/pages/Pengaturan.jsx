import { useState } from 'react';
import { Save, Upload } from 'lucide-react';

const initSettings = {
  namaAplikasi: 'Pilah Pilih',
  deskripsi: 'Aplikasi daur ulang sampah berbasis komunitas',
  minTarik: 10000,
  biayaAdmin: 1500,
  wa: true,
  email: false,
  push: true,
};

export default function Pengaturan() {
  const [settings, setSettings] = useState(initSettings);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('sistem');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updateField = (field, value) => setSettings(s => ({ ...s, [field]: value }));

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1>⚙️ Pengaturan</h1>
          <p>Konfigurasi sistem aplikasi Pilah Pilih</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleSave} id="save-settings-btn">
            <Save size={16} />
            {saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['sistem', 'keuangan', 'notifikasi'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} id={`settings-tab-${t}`}>
            {t === 'sistem' ? '🖥️ Sistem' : t === 'keuangan' ? '💰 Keuangan' : '🔔 Notifikasi'}
          </button>
        ))}
      </div>

      {/* Sistem */}
      {tab === 'sistem' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card card-padded">
            <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Informasi Aplikasi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Aplikasi</label>
                <input
                  className="form-control"
                  value={settings.namaAplikasi}
                  onChange={e => updateField('namaAplikasi', e.target.value)}
                  placeholder="Nama aplikasi"
                  id="settings-nama-app"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={settings.deskripsi}
                  onChange={e => updateField('deskripsi', e.target.value)}
                  placeholder="Deskripsi singkat aplikasi"
                  id="settings-deskripsi"
                />
              </div>
            </div>
          </div>

          <div className="card card-padded">
            <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Logo & Branding</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Logo */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Logo Aplikasi</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>♻️</div>
                  <button className="btn btn-ghost" id="upload-logo-btn">
                    <Upload size={16} /> Upload Logo Baru
                  </button>
                </div>
              </div>
              {/* Banner */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Banner Aplikasi</label>
                <div style={{ width: '100%', height: 120, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--brand), var(--brand-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <span style={{ color: 'white', fontWeight: 700, opacity: 0.8 }}>Banner Pilah Pilih</span>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem' }} id="upload-banner-btn">
                  <Upload size={14} /> Ganti Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keuangan */}
      {tab === 'keuangan' && (
        <div className="card card-padded">
          <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Pengaturan Keuangan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Minimal Tarik Saldo (Rp)</label>
              <input
                className="form-control"
                type="number"
                value={settings.minTarik}
                onChange={e => updateField('minTarik', Number(e.target.value))}
                id="settings-min-tarik"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                User hanya bisa menarik saldo minimal Rp {settings.minTarik.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Biaya Admin per Penarikan (Rp)</label>
              <input
                className="form-control"
                type="number"
                value={settings.biayaAdmin}
                onChange={e => updateField('biayaAdmin', Number(e.target.value))}
                id="settings-biaya-admin"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Biaya admin Rp {settings.biayaAdmin.toLocaleString('id-ID')} akan dipotong dari setiap penarikan
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--warning-light)', borderRadius: 'var(--radius-lg)', border: '1px solid #fde68a' }}>
              <p style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 600 }}>
                ⚠️ Perubahan pengaturan keuangan akan berpengaruh pada semua transaksi berikutnya.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi */}
      {tab === 'notifikasi' && (
        <div className="card card-padded">
          <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Pengaturan Notifikasi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { field: 'wa', icon: '📱', label: 'WhatsApp', desc: 'Kirim notifikasi melalui WhatsApp' },
              { field: 'email', icon: '📧', label: 'Email', desc: 'Kirim notifikasi melalui email' },
              { field: 'push', icon: '🔔', label: 'Push Notification', desc: 'Kirim push notification ke aplikasi mobile' },
            ].map(n => (
              <div key={n.field} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <span style={{ fontSize: '1.5rem' }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{n.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{n.desc}</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings[n.field]}
                    onChange={e => updateField(n.field, e.target.checked)}
                    id={`settings-notif-${n.field}`}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
