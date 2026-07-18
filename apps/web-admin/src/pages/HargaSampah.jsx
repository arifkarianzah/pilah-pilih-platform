import { useState, useEffect, useCallback } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { priceAPI } from '../services/api';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const Toast = ({ msg }) => msg ? (
  <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--brand)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 700, zIndex: 9999, boxShadow: 'var(--shadow-lg)' }}>✓ {msg}</div>
) : null;

export default function HargaSampah() {
  const [prices, setPrices] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const [p, h] = await Promise.all([priceAPI.getAll(), priceAPI.getHistory()]);
      if (p.success) setPrices(p.data);
      if (h.success) setHistory(h.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (price) => { setEditId(price.id); setEditValue(price.price_per_kg); };
  const cancelEdit = () => { setEditId(null); setEditValue(''); };

  const savePrice = async (id) => {
    if (!editValue || isNaN(editValue)) return;
    setSaving(true);
    try {
      const res = await priceAPI.update(id, Number(editValue));
      if (res.success) { showToast('Harga berhasil diperbarui'); setEditId(null); load(); }
    } catch (err) { showToast(err.response?.data?.message || 'Gagal menyimpan harga'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-content">
      <Toast msg={toast} />

      <div className="page-header">
        <div className="page-header-left">
          <h1>💰 Harga Sampah</h1>
          <p>{prices.length} jenis sampah dengan harga aktif</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
        {/* Daftar Harga */}
        <div className="card">
          <div className="card-header"><h3>Harga per Kilogram</h3></div>
          {loading ? (
            <div className="empty-state"><div className="spinner" /><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data...</p></div>
          ) : (
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {prices.map(price => (
                <div key={price.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem',
                  background: editId === price.id ? 'rgba(34,197,94,0.05)' : 'var(--surface-2)',
                  borderRadius: 'var(--radius-md)', border: editId === price.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{price.waste_type}</div>
                    {editId !== price.id ? (
                      <div style={{ fontWeight: 900, color: 'var(--brand)', fontSize: '1rem' }}>{fmt(price.price_per_kg)}/kg</div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Rp</span>
                        <input
                          className="form-control"
                          type="number"
                          style={{ width: 130, padding: '0.3rem 0.6rem', fontSize: '0.9rem', fontWeight: 700 }}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          autoFocus
                          id={`price-input-${price.id}`}
                        />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>/kg</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {editId === price.id ? (
                      <>
                        <button className="btn btn-success btn-icon btn-sm" onClick={() => savePrice(price.id)} disabled={saving} id={`price-save-${price.id}`}><Save size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={cancelEdit} id={`price-cancel-${price.id}`}><X size={14} /></button>
                      </>
                    ) : (
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => startEdit(price)} id={`price-edit-${price.id}`}><Edit2 size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
              {prices.length === 0 && <div className="empty-state"><div className="icon">💰</div><h3>Belum ada harga sampah</h3></div>}
            </div>
          )}
        </div>

        {/* Riwayat Perubahan */}
        <div className="card">
          <div className="card-header"><h3>Riwayat Perubahan Harga</h3></div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Jenis</th><th>Harga Lama</th><th>Harga Baru</th><th>Diubah oleh</th><th>Waktu</th></tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{h.waste_type}</td>
                    <td style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{fmt(h.old_price)}</td>
                    <td style={{ fontWeight: 800, color: 'var(--brand)' }}>{fmt(h.new_price)}</td>
                    <td>{h.changed_by_name || 'Admin'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={5}><div className="empty-state" style={{ padding: '2rem' }}><div className="icon">📝</div><h3>Belum ada riwayat perubahan</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
