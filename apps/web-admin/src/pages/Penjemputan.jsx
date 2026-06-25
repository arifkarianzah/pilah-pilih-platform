import { useState, useEffect, useCallback } from 'react';
import { Search, Eye } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { pickupAPI } from '../services/api';

export default function Penjemputan() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await pickupAPI.getAll();
      if (res.success) setList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(p => {
    const matchSearch = p.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search) ||
      p.petugas_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const countByStatus = (s) => list.filter(p => p.status === s).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1>📋 Monitoring Penjemputan</h1>
          <p>Pantau status penjemputan sampah</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Menunggu', key: 'pending', icon: '⏳', bg: '#fffbeb', color: '#92400e' },
          { label: 'Diterima', key: 'accepted', icon: '✅', bg: '#dbeafe', color: '#1e40af' },
          { label: 'Dalam Perjalanan', key: 'on_the_way', icon: '🚚', bg: '#ede9fe', color: '#5b21b6' },
          { label: 'Selesai', key: 'completed', icon: '🎉', bg: '#dcfce7', color: '#0f4c2a' },
          { label: 'Dibatalkan', key: 'cancelled', icon: '❌', bg: '#fee2e2', color: '#991b1b' },
        ].map(s => (
          <div className="stat-card" key={s.key}
            style={{ cursor: 'pointer', outline: filterStatus === s.key ? `2px solid var(--primary)` : 'none' }}
            onClick={() => setFilterStatus(filterStatus === s.key ? '' : s.key)}
          >
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.4rem' }}>{s.icon}</span></div>
            <div className="stat-info"><div className="label">{s.label}</div><div className="value" style={{ color: s.color }}>{countByStatus(s.key)}</div></div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Cari ID, user, atau petugas..." value={search} onChange={e => setSearch(e.target.value)} id="pickup-search" />
        </div>
        <select className="form-control form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="pickup-status-filter">
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="accepted">Diterima</option>
          <option value="on_the_way">Dalam Perjalanan</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data...</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>User</th><th>Petugas</th><th>Jenis Sampah</th><th>Estimasi</th><th>Berat Aktual</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand)' }}>#{p.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="avatar avatar-sm" style={{ background: '#0f4c2a' }}>{p.user_name?.[0] || '?'}</div>
                        <span style={{ fontWeight: 700 }}>{p.user_name || '-'}</span>
                      </div>
                    </td>
                    <td>{p.petugas_name || <span style={{ color: 'var(--text-light)' }}>Belum ditugaskan</span>}</td>
                    <td>{p.waste_type || '-'}</td>
                    <td>{p.estimated_weight ? `${p.estimated_weight} kg` : '-'}</td>
                    <td style={{ fontWeight: 700 }}>{p.actual_weight ? `${p.actual_weight} kg` : '-'}</td>
                    <td><Badge status={p.status} /></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleString('id-ID')}</td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDetail(p)} id={`pickup-detail-${p.id}`}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9}><div className="empty-state"><div className="icon">📋</div><h3>Tidak ada data penjemputan</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Detail Penjemputan">
        {detail && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '2rem' }}>📋</span>
              <div>
                <h3 style={{ fontWeight: 900, color: 'var(--brand)' }}>Order #{detail.id}</h3>
                <Badge status={detail.status} />
              </div>
            </div>
            <div className="info-row"><span className="info-label">User</span><span className="info-value">{detail.user_name}</span></div>
            <div className="info-row"><span className="info-label">Petugas</span><span className="info-value">{detail.petugas_name || 'Belum ditugaskan'}</span></div>
            <div className="info-row"><span className="info-label">Alamat</span><span className="info-value">{detail.address || '-'}</span></div>
            <div className="info-row"><span className="info-label">Jenis Sampah</span><span className="info-value">{detail.waste_type}</span></div>
            <div className="info-row"><span className="info-label">Estimasi Berat</span><span className="info-value">{detail.estimated_weight ? `${detail.estimated_weight} kg` : '-'}</span></div>
            <div className="info-row"><span className="info-label">Berat Aktual</span><span className="info-value" style={{ fontWeight: 800, color: 'var(--brand)' }}>{detail.actual_weight ? `${detail.actual_weight} kg` : 'Belum ditimbang'}</span></div>
            <div className="info-row"><span className="info-label">Tanggal Pickup</span><span className="info-value">{detail.pickup_date || '-'}</span></div>
            <div className="info-row"><span className="info-label">Dibuat</span><span className="info-value">{new Date(detail.created_at).toLocaleString('id-ID')}</span></div>
          </>
        )}
      </Modal>
    </div>
  );
}
