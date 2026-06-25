import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, UserCheck, UserX, Trash2 } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { userAPI } from '../services/api';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function KelolaUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await userAPI.getAll();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'active' ? u.is_active !== 0 :
      filterStatus === 'inactive' ? u.is_active === 0 : true;
    return matchSearch && matchStatus;
  });

  const toggleStatus = async (id) => {
    setActionLoading(true);
    try {
      const res = await userAPI.toggleStatus(id);
      if (res.success) { showToast('Status user berhasil diubah'); load(); }
    } catch (err) { showToast('Gagal mengubah status'); }
    finally { setActionLoading(false); }
  };

  const deleteUser = async (id) => {
    setActionLoading(true);
    try {
      const res = await userAPI.delete(id);
      if (res.success) { showToast('User berhasil dihapus'); setDeleteTarget(null); load(); }
    } catch (err) { showToast('Gagal menghapus user'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="page-content">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--brand)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 700, zIndex: 9999, boxShadow: 'var(--shadow-lg)', animation: 'slideUp 0.3s ease' }}>
          ✓ {toast}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1>👥 Kelola User</h1>
          <p>Total {users.length} pengguna terdaftar</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama atau email user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="user-search"
          />
        </div>
        <select className="form-control form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="user-status-filter">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data...</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Total Sampah</th>
                  <th>Saldo</th>
                  <th>Status</th>
                  <th>Bergabung</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="avatar avatar-sm" style={{ background: `hsl(${u.id * 60}, 60%, 35%)` }}>
                          {u.name?.[0] || '?'}
                        </div>
                        <span style={{ fontWeight: 700 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ fontWeight: 700 }}>{Number(u.total_sampah || 0).toFixed(1)} kg</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{fmt(u.saldo)}</td>
                    <td>
                      <Badge status={u.is_active !== 0 ? 'active' : 'inactive'} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Detail" onClick={() => setDetail(u)} id={`user-detail-${u.id}`}><Eye size={15} /></button>
                        <button
                          className={`btn btn-icon btn-sm ${u.is_active !== 0 ? 'btn-warning' : 'btn-success'}`}
                          title={u.is_active !== 0 ? 'Nonaktifkan' : 'Aktifkan'}
                          onClick={() => toggleStatus(u.id)}
                          disabled={actionLoading}
                          id={`user-toggle-${u.id}`}
                        >
                          {u.is_active !== 0 ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" title="Hapus" onClick={() => setDeleteTarget(u)} id={`user-delete-${u.id}`}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8}><div className="empty-state"><div className="icon">👥</div><h3>Tidak ada user ditemukan</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Detail User" size="sm">
        {detail && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div className="avatar avatar-lg" style={{ margin: '0 auto 0.5rem', background: `hsl(${detail.id * 60}, 60%, 35%)` }}>{detail.name?.[0]}</div>
              <h3 style={{ fontWeight: 800 }}>{detail.name}</h3>
              <Badge status={detail.is_active !== 0 ? 'active' : 'inactive'} />
            </div>
            <div className="info-row"><span className="info-label">Email</span><span className="info-value">{detail.email}</span></div>
            <div className="info-row"><span className="info-label">No HP</span><span className="info-value">{detail.phone || '-'}</span></div>
            <div className="info-row"><span className="info-label">Alamat</span><span className="info-value">{detail.address || '-'}</span></div>
            <div className="info-row"><span className="info-label">Total Sampah</span><span className="info-value" style={{ color: 'var(--brand)', fontWeight: 800 }}>{Number(detail.total_sampah || 0).toFixed(1)} kg</span></div>
            <div className="info-row"><span className="info-label">Saldo</span><span className="info-value" style={{ color: 'var(--brand)', fontWeight: 800 }}>{fmt(detail.saldo)}</span></div>
            <div className="info-row"><span className="info-label">Total Penarikan</span><span className="info-value">{fmt(detail.total_penarikan)}</span></div>
            <div className="info-row"><span className="info-label">Total Pickup</span><span className="info-value">{detail.total_pickup || 0} kali</span></div>
            <div className="info-row"><span className="info-label">Bergabung</span><span className="info-value">{new Date(detail.created_at).toLocaleDateString('id-ID')}</span></div>
          </>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus User" size="sm"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
          <button className="btn btn-danger" disabled={actionLoading} onClick={() => deleteUser(deleteTarget?.id)}>
            {actionLoading ? '...' : 'Ya, Hapus'}
          </button>
        </>}
      >
        {deleteTarget && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🗑️</div>
            <p>Yakin hapus user <strong>{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
