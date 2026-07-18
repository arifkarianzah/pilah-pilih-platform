import { useState, useEffect } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { getNotifications, markNotifRead, markAllNotifsRead } from '../api/pengepulAPI';
import PageHeader from '../components/UI/PageHeader';
import { toast } from '../components/UI/Toast';

const DUMMY = [
  { id: 1, title: 'Kiriman Baru Masuk', message: 'Petugas Andi mengirim 45 Kg Besi. Harap ditinjau.', is_read: false, created_at: new Date().toISOString(), type: 'kiriman' },
  { id: 2, title: 'Stok Menipis!', message: 'Stok Plastik PET hanya tersisa 15 Kg. Segera tindak lanjuti.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(), type: 'stok' },
  { id: 3, title: 'Penjualan Berhasil', message: 'Penjualan 200 Kg Kardus ke Pabrik Maju senilai Rp 300.000 selesai.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString(), type: 'penjualan' },
  { id: 4, title: 'Pengumuman Admin', message: 'Harga sampah Besi naik menjadi Rp 6.500/Kg mulai hari ini.', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString(), type: 'info' },
  { id: 5, title: 'Kiriman Ditolak', message: 'Kiriman sampah dari warga Siti Rahayu ditolak karena kondisi tidak sesuai.', is_read: false, created_at: new Date(Date.now() - 7200000).toISOString(), type: 'kiriman' },
];

const NOTIF_ICONS = {
  kiriman: '📦', stok: '⚠️', penjualan: '🏭', info: '📢',
};

const NOTIF_COLORS = {
  kiriman: '#3B82F6', stok: '#F59E0B', penjualan: '#10B981', info: '#8B5CF6',
};

const Notifikasi = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifs(res.data.notifications || []);
    } catch {
      setNotifs(DUMMY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRead = async (id) => {
    try {
      await markNotifRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotifsRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Semua notifikasi ditandai sudah dibaca.');
    } catch {
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Semua notifikasi ditandai sudah dibaca.');
    }
  };

  const filtered = notifs.filter(n => {
    if (filter === 'belum') return !n.is_read;
    if (filter === 'sudah') return n.is_read;
    return true;
  });

  const unread = notifs.filter(n => !n.is_read).length;

  const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Baru saja';
    if (min < 60) return `${min} menit lalu`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour} jam lalu`;
    return `${Math.floor(hour / 24)} hari lalu`;
  };

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        subtitle={`${unread} notifikasi belum dibaca`}
        action={
          unread > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleReadAll}>
              <FiCheck /> Tandai Semua Dibaca
            </button>
          )
        }
      />

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {[
          { key: 'semua', label: `Semua (${notifs.length})` },
          { key: 'belum', label: `Belum Dibaca (${unread})` },
          { key: 'sudah', label: 'Sudah Dibaca' },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner"></div><span>Memuat notifikasi...</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(n => {
            const color = NOTIF_COLORS[n.type] || '#10B981';
            return (
              <div
                key={n.id}
                className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                onClick={() => !n.is_read && handleRead(n.id)}
                style={{ cursor: !n.is_read ? 'pointer' : 'default' }}
              >
                <div className="notif-icon" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  {NOTIF_ICONS[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{n.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 6 }}>
                    {relativeTime(n.created_at)}
                  </div>
                </div>
                {!n.is_read && <div className="notif-dot"></div>}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="empty-state glass-card">
              <div className="empty-state-icon"><FiBell /></div>
              <h3>Tidak Ada Notifikasi</h3>
              <p>Semua notifikasi sudah dibaca.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifikasi;
