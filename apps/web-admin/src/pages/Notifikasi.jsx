import { useState, useEffect, useCallback } from 'react';
import { notifAPI } from '../services/api';

const tipeLabels = {
  user: { label: 'User Baru', cls: 'badge-success', icon: '👤', bg: '#dcfce7' },
  withdraw: { label: 'Penarikan', cls: 'badge-warning', icon: '💳', bg: '#fffbeb' },
  pickup: { label: 'Penjemputan', cls: 'badge-info', icon: '🚚', bg: '#dbeafe' },
  sampah: { label: 'Sampah', cls: 'badge-purple', icon: '♻️', bg: '#ede9fe' },
};

function getNotifTipe(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('user') || t.includes('daftar')) return 'user';
  if (t.includes('tarik') || t.includes('withdraw')) return 'withdraw';
  if (t.includes('jemput') || t.includes('pickup')) return 'pickup';
  return 'sampah';
}

export default function Notifikasi() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTipe, setFilterTipe] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await notifAPI.getAll();
      if (res.success) setNotifs(res.data.map(n => ({ ...n, tipe: getNotifTipe(n.title) })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const belumDibaca = notifs.filter(n => !n.is_read).length;

  const tandaiBacaSemua = async () => {
    try {
      await notifAPI.readAll();
      setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const tandaiBaca = async (id) => {
    const target = notifs.find(n => n.id === id);
    if (target && target.is_read) return; // already read

    try {
      await notifAPI.read(id);
      setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifs.filter(n => filterTipe ? n.tipe === filterTipe : true);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1>🔔 Notifikasi</h1>
          <p>{belumDibaca} notifikasi belum dibaca</p>
        </div>
        <div className="page-header-actions">
          {belumDibaca > 0 && (
            <button className="btn btn-outline" onClick={tandaiBacaSemua} id="tandai-baca-semua-btn">✓ Tandai Semua Dibaca</button>
          )}
        </div>
      </div>

      {/* Stats filter */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {Object.entries(tipeLabels).map(([key, val]) => (
          <div key={key} className="stat-card"
            style={{ cursor: 'pointer', outline: filterTipe === key ? '2px solid var(--primary)' : 'none' }}
            onClick={() => setFilterTipe(filterTipe === key ? '' : key)}
          >
            <div className="stat-icon" style={{ background: val.bg }}><span style={{ fontSize: '1.4rem' }}>{val.icon}</span></div>
            <div className="stat-info">
              <div className="label">{val.label}</div>
              <div className="value">{notifs.filter(n => n.tipe === key).length}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Notif list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><div className="spinner" /><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat notifikasi...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">🔔</div><h3>Tidak ada notifikasi</h3></div>
        ) : (
          filtered.map(n => {
            const info = tipeLabels[n.tipe] || { icon: '📌', bg: '#f1f5f9' };
            const timeStr = new Date(n.created_at).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
            return (
              <div key={n.id}
                style={{
                  display: 'flex', gap: '1rem', padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  background: n.is_read ? 'transparent' : 'rgba(34,197,94,0.04)',
                  transition: 'background 0.2s', cursor: 'pointer', alignItems: 'flex-start',
                }}
                onClick={() => tandaiBaca(n.id)}
                id={`notif-item-${n.id}`}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                  {info.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{n.title}</span>
                    <span className={`badge ${tipeLabels[n.tipe]?.cls || 'badge-neutral'}`}>{tipeLabels[n.tipe]?.label || n.tipe}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>— {n.user_name}</span>
                    {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginLeft: 'auto', flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{n.message}</p>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeStr}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
