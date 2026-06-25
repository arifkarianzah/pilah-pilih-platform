import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { wasteTypeAPI } from '../services/api';

const emptyForm = { nama: '', ikon: '♻️', deskripsi: '' };

const Toast = ({ msg }) => msg ? (
  <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--brand)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 700, zIndex: 9999, boxShadow: 'var(--shadow-lg)' }}>✓ {msg}</div>
) : null;

export default function JenisSampah() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await wasteTypeAPI.getAll();
      if (res.success) setList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setFormModal(true); };
  const openEdit = (j) => { setEditTarget(j); setForm({ nama: j.name, ikon: j.icon, deskripsi: j.description || '' }); setFormModal(true); };

  const saveForm = async () => {
    if (!form.nama) return;
    setActionLoading(true);
    try {
      const data = { name: form.nama, icon: form.ikon, description: form.deskripsi };
      const res = editTarget ? await wasteTypeAPI.edit(editTarget.id, data) : await wasteTypeAPI.add(data);
      if (res.success) { showToast(editTarget ? 'Jenis sampah diperbarui' : 'Jenis sampah ditambahkan'); setFormModal(false); load(); }
    } catch (err) { showToast(err.response?.data?.message || 'Terjadi kesalahan'); }
    finally { setActionLoading(false); }
  };

  const toggleStatus = async (id) => {
    setActionLoading(true);
    try {
      const res = await wasteTypeAPI.toggle(id);
      if (res.success) { showToast('Status berhasil diubah'); load(); }
    } catch { showToast('Gagal mengubah status'); }
    finally { setActionLoading(false); }
  };

  const deleteItem = async (id) => {
    setActionLoading(true);
    try {
      const res = await wasteTypeAPI.delete(id);
      if (res.success) { showToast('Jenis sampah dihapus'); setDeleteTarget(null); load(); }
    } catch { showToast('Gagal menghapus'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="page-content">
      <Toast msg={toast} />

      <div className="page-header">
        <div className="page-header-left">
          <h1>🗑️ Jenis Sampah</h1>
          <p>{list.filter(j => j.is_active).length} aktif dari {list.length} jenis sampah</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd} id="add-jenis-btn"><Plus size={16} /> Tambah Jenis</button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner" /><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data...</p></div>
      ) : (
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          {list.map(j => (
            <div key={j.id} className="card card-padded" style={{ opacity: j.is_active ? 1 : 0.55, transition: 'opacity 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '2.2rem' }}>{j.icon}</div>
                <Badge status={j.is_active ? 'active' : 'inactive'} />
              </div>
              <h3 style={{ fontWeight: 800, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{j.name}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{j.description || '-'}</p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(j)} id={`jenis-edit-${j.id}`}><Edit2 size={13} /> Edit</button>
                <button className={`btn btn-sm ${j.is_active ? 'btn-warning' : 'btn-success'}`} style={{ flex: 1 }} onClick={() => toggleStatus(j.id)} disabled={actionLoading} id={`jenis-toggle-${j.id}`}>
                  {j.is_active ? 'Nonaktif' : 'Aktifkan'}
                </button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(j)} id={`jenis-delete-${j.id}`}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="empty-state"><div className="icon">🗑️</div><h3>Belum ada jenis sampah</h3></div>}
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editTarget ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setFormModal(false)}>Batal</button>
          <button className="btn btn-primary" onClick={saveForm} disabled={actionLoading} id="save-jenis-btn">{actionLoading ? '...' : 'Simpan'}</button>
        </>}
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nama Jenis</label>
            <input className="form-control" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="mis. Plastik PET" id="jenis-nama" />
          </div>
          <div className="form-group">
            <label className="form-label">Ikon (emoji)</label>
            <input className="form-control" value={form.ikon} onChange={e => setForm(f => ({ ...f, ikon: e.target.value }))} placeholder="♻️" id="jenis-ikon" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea className="form-control" rows={2} value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Deskripsi singkat jenis sampah..." id="jenis-deskripsi" />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Jenis Sampah" size="sm"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
          <button className="btn btn-danger" disabled={actionLoading} onClick={() => deleteItem(deleteTarget?.id)}>{actionLoading ? '...' : 'Hapus'}</button>
        </>}
      >
        {deleteTarget && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{deleteTarget.icon}</div><p>Hapus jenis sampah <strong>{deleteTarget.name}</strong>?</p></div>}
      </Modal>
    </div>
  );
}
