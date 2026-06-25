import { useState } from 'react';
import { Search, MessageSquare, X } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const tiketData = [
  { id: 'TKT-001', user: 'Budi Santoso', email: 'budi@email.com', subjek: 'Saldo tidak bertambah setelah penjemputan', pesan: 'Halo admin, saya sudah melakukan penjemputan 3 hari lalu tapi saldo saya belum bertambah. Mohon dicek ya.', status: 'open', tgl: '2026-06-23 10:00', balasan: [] },
  { id: 'TKT-002', user: 'Siti Rahayu', email: 'siti@email.com', subjek: 'Petugas tidak datang sesuai jadwal', pesan: 'Sudah menunggu 2 jam tapi petugas tidak kunjung datang. Order saya PP-0237.', status: 'open', tgl: '2026-06-23 08:30', balasan: [] },
  { id: 'TKT-003', user: 'Ahmad Dahlan', email: 'ahmad@email.com', subjek: 'Tidak bisa melakukan penarikan saldo', pesan: 'Setiap kali saya klik tarik saldo, aplikasi error. Sudah coba berkali-kali.', status: 'replied', tgl: '2026-06-22 14:00', balasan: ['Admin: Mohon maaf atas ketidaknyamanannya. Tim teknis kami sedang memperbaiki masalah ini. Estimasi selesai 24 jam.'] },
  { id: 'TKT-004', user: 'Dewi Kurnia', email: 'dewi@email.com', subjek: 'Pertanyaan tentang jenis sampah yang diterima', pesan: 'Apakah baterai bekas bisa dikumpulkan? Saya punya banyak di rumah.', status: 'closed', tgl: '2026-06-21 09:00', balasan: ['Admin: Untuk saat ini kami belum menerima baterai bekas. Silakan pantau update aplikasi kami. Terima kasih!'] },
];

export default function PusatBantuan() {
  const [tikets, setTikets] = useState(tiketData);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [balasanText, setBalasanText] = useState('');

  const filtered = tikets.filter(t => {
    const matchSearch = t.user.toLowerCase().includes(search.toLowerCase()) || t.subjek.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const kirimBalasan = () => {
    if (!balasanText.trim()) return;
    setTikets(t => t.map(x => x.id === selected.id ? { ...x, status: 'replied', balasan: [...x.balasan, `Admin: ${balasanText}`] } : x));
    setSelected(prev => ({ ...prev, status: 'replied', balasan: [...prev.balasan, `Admin: ${balasanText}`] }));
    setBalasanText('');
  };

  const tutupTiket = (id) => {
    setTikets(t => t.map(x => x.id === id ? { ...x, status: 'closed' } : x));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'closed' }));
  };

  const statusLabel = { open: 'Terbuka', replied: 'Dibalas', closed: 'Ditutup' };
  const statusBadge = { open: 'badge-warning', replied: 'badge-info', closed: 'badge-neutral' };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1>💬 Pusat Bantuan</h1>
          <p>{tikets.filter(t => t.status === 'open').length} tiket terbuka menunggu respons</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Terbuka', key: 'open', icon: '📬', bg: '#fffbeb', color: '#92400e' },
          { label: 'Dibalas', key: 'replied', icon: '💬', bg: '#dbeafe', color: '#1e40af' },
          { label: 'Ditutup', key: 'closed', icon: '✅', bg: '#dcfce7', color: '#0f4c2a' },
        ].map(s => (
          <div className="stat-card" key={s.key}>
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.4rem' }}>{s.icon}</span></div>
            <div className="stat-info">
              <div className="label">{s.label}</div>
              <div className="value" style={{ color: s.color }}>{tikets.filter(t => t.status === s.key).length}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Cari user atau subjek..." value={search} onChange={e => setSearch(e.target.value)} id="tiket-search" />
        </div>
        <select className="form-control form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="tiket-status-filter">
          <option value="">Semua</option>
          <option value="open">Terbuka</option>
          <option value="replied">Dibalas</option>
          <option value="closed">Ditutup</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Subjek</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand)' }}>{t.id}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{t.user}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email}</div>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subjek}</div>
                  </td>
                  <td>
                    <span className={`badge ${statusBadge[t.status]}`}>
                      <span className="badge-dot" />{statusLabel[t.status]}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.tgl}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => setSelected(t)} id={`tiket-balas-${t.id}`}>
                        <MessageSquare size={13} /> Balas
                      </button>
                      {t.status !== 'closed' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => tutupTiket(t.id)} id={`tiket-tutup-${t.id}`}>
                          <X size={13} /> Tutup
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state"><div className="icon">💬</div><h3>Tidak ada tiket</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tiket Detail & Balas Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Tiket ${selected?.id}`} size="lg">
        {selected && (
          <>
            <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selected.subjek}</div>
                <span className={`badge ${statusBadge[selected.status]}`}>{statusLabel[selected.status]}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {selected.user} · {selected.tgl}
              </div>
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.82rem', marginBottom: '0.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>Pesan User:</div>
                <p style={{ fontSize: '0.875rem' }}>{selected.pesan}</p>
              </div>
            </div>

            {selected.balasan.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {selected.balasan.map((b, i) => (
                  <div key={i} style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', borderLeft: '3px solid var(--primary)' }}>
                    {b}
                  </div>
                ))}
              </div>
            )}

            {selected.status !== 'closed' && (
              <>
                <div className="form-group">
                  <label className="form-label">Tulis Balasan</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={balasanText}
                    onChange={e => setBalasanText(e.target.value)}
                    placeholder="Ketik balasan untuk user..."
                    id="balas-tiket-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={kirimBalasan} id="kirim-balasan-btn">
                    <MessageSquare size={15} /> Kirim Balasan
                  </button>
                  <button className="btn btn-ghost" onClick={() => tutupTiket(selected.id)} id="tutup-tiket-modal-btn">
                    <X size={15} /> Tutup Tiket
                  </button>
                </div>
              </>
            )}

            {selected.status === 'closed' && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                ✅ Tiket ini telah ditutup.
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
