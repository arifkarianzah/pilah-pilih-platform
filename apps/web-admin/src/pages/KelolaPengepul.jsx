import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, CheckCircle } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { pengepulAPI } from '../services/api';

const emptyForm = { nama: '', email: '', password: '', hp: '', company_name: '', address: '' };

const Toast = ({ msg }) => msg ? (
  <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--brand)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 700, zIndex: 9999, boxShadow: 'var(--shadow-lg)' }}>✓ {msg}</div>
) : null;

export default function KelolaPengepul() {
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
      const res = await pengepulAPI.getAll();
      if (res.success) setList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setFormModal(true); };
  const openEdit = (p) => {
    setEditTarget(p);
    setForm({ nama: p.name, email: p.email, password: '', hp: p.phone || '', company_name: p.company_name || '', address: p.address || '' });
    setFormModal(true);
  };

  const saveForm = async () => {
    if (!form.nama || !form.email) return;
    if (!editTarget && !form.password) { showToast('Password wajib untuk pengepul baru'); return; }
    setActionLoading(true);
    try {
      const data = { name: form.nama, email: form.email, phone: form.hp, company_name: form.company_name, address: form.address, ...(form.password ? { password: form.password } : {}) };
      const res = editTarget ? await pengepulAPI.edit(editTarget.id, data) : await pengepulAPI.add(data);
      if (res.success) { showToast(editTarget ? 'Pengepul berhasil diperbarui' : 'Pengepul berhasil ditambahkan'); setFormModal(false); load(); }
    } catch (err) { showToast(err.response?.data?.message || 'Terjadi kesalahan'); }
    finally { setActionLoading(false); }
  };

  const toggleVerifikasi = async (id) => {
    setActionLoading(true);
    try {
      const res = await pengepulAPI.toggleVerifikasi(id);
      if (res.success) { showToast('Status verifikasi berhasil diubah'); load(); }
    } catch { showToast('Gagal mengubah verifikasi'); }
    finally { setActionLoading(false); }
  };

  const deletePengepul = async (id) => {
    setActionLoading(true);
    try {
      const res = await pengepulAPI.delete(id);
      if (res.success) { showToast('Pengepul berhasil dihapus'); setDeleteTarget(null); load(); }
    } catch { showToast('Gagal menghapus'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="page-content">
      <Toast msg={toast} />

      <div className="page-header">
        <div className="page-header-left">
          <h1>♻️ Kelola Pengepul</h1>
          <p>{list.filter(p => p.is_verified).length} terverifikasi dari {list.length} pengepul</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd} id="add-pengepul-btn"><Plus size={16} /> Tambah Pengepul</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Cari nama atau perusahaan..." value={search} onChange={e => setSearch(e.target.value)} id="pengepul-search" />
        </div>
      </div>

      <div className="card">
        {loading ? <div className="empty-state"><div className="spinner" /><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data...</p></div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Pengepul</th><th>Perusahaan</th><th>HP</th><th>Total Sampah</th><th>Transaksi</th><th>Status</th><th>Bergabung</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="avatar avatar-sm" style={{ background: `hsl(${p.id * 90}, 50%, 35%)` }}>{p.name?.[0]}</div>
                        <span style={{ fontWeight: 700 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.company_name || '-'}</td>
                    <td>{p.phone || '-'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{Number(p.total_sampah || 0).toFixed(1)} kg</td>
                    <td style={{ fontWeight: 700 }}>{p.total_transaksi || 0}</td>
                    <td><Badge status={p.is_verified ? 'verified' : 'unverified'} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDetail(p)} id={`pengepul-detail-${p.id}`}><Eye size={14} /></button>
                        <button className="btn btn-info btn-icon btn-sm" onClick={() => openEdit(p)} id={`pengepul-edit-${p.id}`}><Edit2 size={14} /></button>
                        <button className={`btn btn-icon btn-sm ${p.is_verified ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleVerifikasi(p.id)} disabled={actionLoading} title="Toggle verifikasi" id={`pengepul-verify-${p.id}`}><CheckCircle size={14} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(p)} id={`pengepul-delete-${p.id}`}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">♻️</div><h3>Tidak ada pengepul</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Detail Pengepul">
        {detail && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div className="avatar avatar-lg" style={{ margin: '0 auto 0.5rem', background: `hsl(${detail.id * 90}, 50%, 35%)` }}>{detail.name?.[0]}</div>
              <h3 style={{ fontWeight: 800 }}>{detail.name}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{detail.company_name || '-'}</p>
              <div style={{ marginTop: '0.5rem' }}><Badge status={detail.is_verified ? 'verified' : 'unverified'} /></div>
            </div>
            <div className="info-row"><span className="info-label">Email</span><span className="info-value">{detail.email}</span></div>
            <div className="info-row"><span className="info-label">No HP</span><span className="info-value">{detail.phone || '-'}</span></div>
            <div className="info-row"><span className="info-label">Alamat</span><span className="info-value">{detail.address || '-'}</span></div>
            <div className="info-row"><span className="info-label">Total Sampah</span><span className="info-value" style={{ color: 'var(--brand)', fontWeight: 800 }}>{Number(detail.total_sampah || 0).toFixed(1)} kg</span></div>
            <div className="info-row"><span className="info-label">Total Transaksi</span><span className="info-value" style={{ fontWeight: 800 }}>{detail.total_transaksi || 0} transaksi</span></div>
          </>
        )}
      </Modal>

      {/* Form */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editTarget ? 'Edit Pengepul' : 'Tambah Pengepul'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setFormModal(false)}>Batal</button>
          <button className="btn btn-primary" onClick={saveForm} disabled={actionLoading} id="save-pengepul-btn">{actionLoading ? '...' : 'Simpan'}</button>
        </>}
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nama</label>
            <input className="form-control" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama pengepul" id="pengepul-nama" />
          </div>
          <div className="form-group">
            <label className="form-label">Nama Perusahaan</label>
            <input className="form-control" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="CV / PT / UD ..." id="pengepul-perusahaan" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@..." id="pengepul-email" />
          </div>
          <div className="form-group">
            <label className="form-label">No HP</label>
            <input className="form-control" value={form.hp} onChange={e => setForm(f => ({ ...f, hp: e.target.value }))} placeholder="08xx-xxxx" id="pengepul-hp" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{editTarget ? 'Password Baru (opsional)' : 'Password'}</label>
          <input className="form-control" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 karakter" id="pengepul-password" />
        </div>
        <div className="form-group">
          <label className="form-label">Alamat</label>
          <textarea className="form-control" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Alamat lengkap..." id="pengepul-alamat" />
        </div>
      </Modal>

      {/* Delete */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Pengepul" size="sm"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
          <button className="btn btn-danger" disabled={actionLoading} onClick={() => deletePengepul(deleteTarget?.id)}>{actionLoading ? '...' : 'Hapus'}</button>
        </>}
      >
        {deleteTarget && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div><p>Hapus pengepul <strong>{deleteTarget.name}</strong>?</p></div>}
      </Modal>
    </div>
  );
}
