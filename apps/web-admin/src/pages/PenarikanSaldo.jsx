import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { withdrawalAPI } from '../services/api';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const Toast = ({ msg }) => msg ? (
  <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--brand)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 700, zIndex: 9999, boxShadow: 'var(--shadow-lg)' }}>✓ {msg}</div>
) : null;

export default function PenarikanSaldo() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detail, setDetail] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await withdrawalAPI.getAll();
      if (res.success) setList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(w => {
    const matchSearch = w.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.bank_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.account_number?.includes(search);
    const matchStatus = filterStatus ? w.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const doApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await withdrawalAPI.approve(id);
      if (res.success) { showToast('Penarikan disetujui'); setDetail(null); load(); }
    } catch (err) { showToast(err.response?.data?.message || 'Gagal menyetujui'); }
    finally { setActionLoading(false); }
  };

  const doSuccess = async (id) => {
    setActionLoading(true);
    try {
      const res = await withdrawalAPI.success(id);
      if (res.success) { showToast('Penarikan berhasil dicairkan!'); setDetail(null); load(); }
    } catch (err) { showToast(err.response?.data?.message || 'Gagal mencairkan'); }
    finally { setActionLoading(false); }
  };

  const doReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      const res = await withdrawalAPI.reject(rejectModal.id, rejectReason);
      if (res.success) { showToast('Penarikan ditolak'); setRejectModal(null); setRejectReason(''); setDetail(null); load(); }
    } catch (err) { showToast(err.response?.data?.message || 'Gagal menolak'); }
    finally { setActionLoading(false); }
  };

  const countByStatus = (s) => list.filter(w => w.status === s).length;

  const statusLabel = { pending: 'Pending', approved: 'Disetujui', success: 'Berhasil', rejected: 'Ditolak' };

  return (
    <div className="page-content">
      <Toast msg={toast} />

      <div className="page-header">
        <div className="page-header-left">
          <h1>💳 Penarikan Saldo</h1>
          <p>{countByStatus('pending')} penarikan menunggu persetujuan</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending', key: 'pending', icon: '⏳', bg: '#fffbeb', color: '#92400e' },
          { label: 'Disetujui', key: 'approved', icon: '✅', bg: '#dbeafe', color: '#1e40af' },
          { label: 'Berhasil', key: 'success', icon: '💸', bg: '#dcfce7', color: '#0f4c2a' },
          { label: 'Ditolak', key: 'rejected', icon: '❌', bg: '#fee2e2', color: '#991b1b' },
        ].map(s => (
          <div className="stat-card" key={s.key} style={{ cursor: 'pointer', outline: filterStatus === s.key ? '2px solid var(--primary)' : 'none' }}
            onClick={() => setFilterStatus(filterStatus === s.key ? '' : s.key)}>
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.4rem' }}>{s.icon}</span></div>
            <div className="stat-info"><div className="label">{s.label}</div><div className="value" style={{ color: s.color }}>{countByStatus(s.key)}</div></div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Cari nama user, bank, atau nomor rekening..." value={search} onChange={e => setSearch(e.target.value)} id="withdrawal-search" />
        </div>
        <select className="form-control form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="withdrawal-status-filter">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Disetujui</option>
          <option value="success">Berhasil</option>
          <option value="rejected">Ditolak</option>
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
                <tr><th>User</th><th>Nominal</th><th>Bank / Dompet</th><th>No. Rekening</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{w.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.user_email}</div>
                    </td>
                    <td style={{ fontWeight: 900, color: 'var(--brand)', fontSize: '1rem' }}>{fmt(w.amount)}</td>
                    <td style={{ fontWeight: 700 }}>{w.bank_name}</td>
                    <td style={{ fontFamily: 'monospace' }}>
                      <div>{w.account_number}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>a.n. {w.account_name}</div>
                    </td>
                    <td><Badge status={w.status} /></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(w.created_at).toLocaleString('id-ID')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDetail(w)} id={`wd-detail-${w.id}`}><Eye size={14} /></button>
                        {w.status === 'pending' && (<>
                          <button className="btn btn-success btn-sm" disabled={actionLoading} onClick={() => doApprove(w.id)} id={`wd-approve-${w.id}`}><CheckCircle size={13} /> Setujui</button>
                          <button className="btn btn-danger btn-sm" disabled={actionLoading} onClick={() => setRejectModal(w)} id={`wd-reject-${w.id}`}><XCircle size={13} /> Tolak</button>
                        </>)}
                        {w.status === 'approved' && (
                          <button className="btn btn-primary btn-sm" disabled={actionLoading} onClick={() => doSuccess(w.id)} id={`wd-success-${w.id}`}>💸 Cairkan</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7}><div className="empty-state"><div className="icon">💳</div><h3>Tidak ada data penarikan</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Detail Penarikan">
        {detail && (
          <>
            <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand)' }}>{fmt(detail.amount)}</div>
                <Badge status={detail.status} />
              </div>
            </div>
            <div className="info-row"><span className="info-label">User</span><span className="info-value">{detail.user_name}</span></div>
            <div className="info-row"><span className="info-label">Email</span><span className="info-value">{detail.user_email}</span></div>
            <div className="info-row"><span className="info-label">Bank / Dompet</span><span className="info-value" style={{ fontWeight: 800 }}>{detail.bank_name}</span></div>
            <div className="info-row"><span className="info-label">No. Rekening</span><span className="info-value" style={{ fontFamily: 'monospace' }}>{detail.account_number}</span></div>
            <div className="info-row"><span className="info-label">Atas Nama</span><span className="info-value">{detail.account_name}</span></div>
            <div className="info-row"><span className="info-label">Tanggal</span><span className="info-value">{new Date(detail.created_at).toLocaleString('id-ID')}</span></div>
            {detail.reject_reason && <div className="info-row"><span className="info-label">Alasan Tolak</span><span className="info-value" style={{ color: 'var(--danger)' }}>{detail.reject_reason}</span></div>}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              {detail.status === 'pending' && (<>
                <button className="btn btn-success" disabled={actionLoading} onClick={() => doApprove(detail.id)}>✅ Setujui</button>
                <button className="btn btn-danger" disabled={actionLoading} onClick={() => { setRejectModal(detail); setDetail(null); }}>❌ Tolak</button>
              </>)}
              {detail.status === 'approved' && (
                <button className="btn btn-primary" disabled={actionLoading} onClick={() => doSuccess(detail.id)}>💸 Cairkan Sekarang</button>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Tolak Penarikan" size="sm"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Batal</button>
          <button className="btn btn-danger" disabled={actionLoading} onClick={doReject}>{actionLoading ? '...' : 'Konfirmasi Tolak'}</button>
        </>}
      >
        {rejectModal && (
          <>
            <p style={{ marginBottom: '0.75rem' }}>Tolak penarikan <strong>{fmt(rejectModal.amount)}</strong> dari <strong>{rejectModal.user_name}</strong>?</p>
            <div className="form-group">
              <label className="form-label">Alasan Penolakan (opsional)</label>
              <textarea className="form-control" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Alasan penolakan untuk dikirim ke user..." id="reject-reason-input" />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
