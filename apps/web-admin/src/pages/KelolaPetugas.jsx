import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, UserCheck, UserX } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { petugasAPI } from '../services/api';

const emptyForm = { nama: '', email: '', password: '', hp: '' };

const Toast = ({ msg }) => msg ? (
  <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--brand)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 700, zIndex: 9999, boxShadow: 'var(--shadow-lg)' }}>
    ✓ {msg}
  </div>
) : null;

export default function KelolaPetugas() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await petugasAPI.getAll();
      if (res.success) setList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setFormModal(true); };
  const openEdit = (p) => { setEditTarget(p); setForm({ nama: p.name, email: p.email, password: '', hp: p.phone || '' }); setFormModal(true); };

  const saveForm = async () => {
    if (!form.nama || !form.email) return;
    if (!editTarget && !form.password) { showToast('Password wajib diisi untuk petugas baru'); return; }
    setActionLoading(true);
    try {
      const data = { name: form.nama, email: form.email, phone: form.hp, ...(form.password ? { password: form.password } : {}) };
      const res = editTarget ? await petugasAPI.edit(editTarget.id, data) : await petugasAPI.add(data);
      if (res.success) { showToast(editTarget ? 'Petugas berhasil diperbarui' : 'Petugas berhasil ditambahkan'); setFormModal(false); load(); }
    } catch (err) { showToast(err.response?.data?.message || 'Terjadi kesalahan'); }
    finally { setActionLoading(false); }
  };

  const toggleStatus = async (id) => {
    setActionLoading(true);
    try {
      const res = await petugasAPI.toggleStatus(id);
      if (res.success) { showToast('Status berhasil diubah'); load(); }
    } catch { showToast('Gagal mengubah status'); }
    finally { setActionLoading(false); }
  };

  const deletePetugas = async (id) => {
    setActionLoading(true);
    try {
      const res = await petugasAPI.delete(id);
      if (res.success) { showToast('Petugas berhasil dihapus'); setDeleteTarget(null); load(); }
    } catch { showToast('Gagal menghapus petugas'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="page-content">
      <Toast msg={toast} />

      <div className="page-header">
        <div className="page-header-left">
          <h1>🚚 Kelola Petugas</h1>
          <p>{list.filter(p => p.is_active !== 0).length} aktif dari {list.length} petugas</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd} id="add-petugas-btn"><Plus size={16} /> Tambah Petugas</button>
        </div>
      </div>

      {/* Stats mini */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Petugas', value: list.length, icon: '🚚', bg: '#dbeafe', color: '#1e40af' },
          { label: 'Aktif', value: list.filter(p => p.is_active !== 0).length, icon: '✅', bg: '#dcfce7', color: '#0f4c2a' },
          { label: 'Total Order', value: list.reduce((s, p) => s + Number(p.total_order || 0), 0), icon: '📦', bg: '#fef3c7', color: '#92400e' },
          { label: 'Nonaktif', value: list.filter(p => p.is_active === 0).length, icon: '❌', bg: '#fee2e2', color: '#991b1b' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.4rem' }}>{s.icon}</span></div>
            <div className="stat-info"><div className="label">{s.label}</div><div className="value" style={{ color: s.color }}>{s.value}</div></div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Cari petugas..." value={search} onChange={e => setSearch(e.target.value)} id="petugas-search" />
        </div>
      </div>

      <div className="card">
        {loading ? <div className="empty-state"><div className="spinner" /><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data...</p></div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Petugas</th><th>Email / HP</th><th>Status</th><th>Total Order</th><th>Total Sampah</th><th>Saldo</th><th>Bergabung</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="avatar avatar-sm" style={{ background: `hsl(${p.id * 80}, 55%, 35%)` }}>{p.name?.[0]}</div>
                        <span style={{ fontWeight: 700 }}>{p.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{p.email}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.phone || '-'}</div>
                    </td>
                    <td><Badge status={p.is_active !== 0 ? 'active' : 'inactive'} /></td>
                    <td style={{ fontWeight: 700 }}>{p.total_order || 0}</td>
                    <td>{Number(p.total_sampah || 0).toFixed(1)} kg</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand)' }}>Rp {Number(p.saldo || 0).toLocaleString('id-ID')}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDetail(p)} id={`petugas-detail-${p.id}`}><Eye size={14} /></button>
                        <button className="btn btn-info btn-icon btn-sm" onClick={() => openEdit(p)} id={`petugas-edit-${p.id}`}><Edit2 size={14} /></button>
                        <button className={`btn btn-icon btn-sm ${p.is_active !== 0 ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleStatus(p.id)} disabled={actionLoading} id={`petugas-toggle-${p.id}`}>
                          {p.is_active !== 0 ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(p)} id={`petugas-delete-${p.id}`}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8}><div className="empty-state"><div className="icon">🚚</div><h3>Tidak ada petugas ditemukan</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Detail Petugas">
        {detail && (
          <div className="grid-2">
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div className="avatar avatar-lg" style={{ margin: '0 auto 0.5rem', background: `hsl(${detail.id * 80}, 55%, 35%)` }}>{detail.name?.[0]}</div>
                <h3 style={{ fontWeight: 800 }}>{detail.name}</h3>
                <Badge status={detail.is_active !== 0 ? 'active' : 'inactive'} />
              </div>
              <div className="info-row"><span className="info-label">Email</span><span className="info-value">{detail.email}</span></div>
              <div className="info-row"><span className="info-label">No HP</span><span className="info-value">{detail.phone || '-'}</span></div>
              <div className="info-row"><span className="info-label">Bergabung</span><span className="info-value">{new Date(detail.created_at).toLocaleDateString('id-ID')}</span></div>
            </div>
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Statistik</h4>
              <div className="info-row"><span className="info-label">Total Order</span><span className="info-value" style={{ fontWeight: 800 }}>{detail.total_order || 0}</span></div>
              <div className="info-row"><span className="info-label">Total Sampah</span><span className="info-value" style={{ fontWeight: 800, color: 'var(--brand)' }}>{Number(detail.total_sampah || 0).toFixed(1)} kg</span></div>
              <div className="info-row"><span className="info-label">Saldo</span><span className="info-value" style={{ fontWeight: 800, color: 'var(--brand)' }}>Rp {Number(detail.saldo || 0).toLocaleString('id-ID')}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editTarget ? 'Edit Petugas' : 'Tambah Petugas'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setFormModal(false)}>Batal</button>
          <button className="btn btn-primary" onClick={saveForm} disabled={actionLoading} id="save-petugas-btn">{actionLoading ? '...' : 'Simpan'}</button>
        </>}
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input className="form-control" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama petugas" id="petugas-nama" />
          </div>
          <div className="form-group">
            <label className="form-label">No HP</label>
            <input className="form-control" value={form.hp} onChange={e => setForm(f => ({ ...f, hp: e.target.value }))} placeholder="08xx-xxxx-xxxx" id="petugas-hp" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@pilahpilih.id" id="petugas-email" />
        </div>
        <div className="form-group">
          <label className="form-label">{editTarget ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</label>
          <input className="form-control" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editTarget ? 'Biarkan kosong jika tidak diubah' : 'Min. 6 karakter'} id="petugas-password" />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Petugas" size="sm"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
          <button className="btn btn-danger" disabled={actionLoading} onClick={() => deletePetugas(deleteTarget?.id)}>{actionLoading ? '...' : 'Hapus'}</button>
        </>}
      >
        {deleteTarget && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <p>Hapus petugas <strong>{deleteTarget.name}</strong>?</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
