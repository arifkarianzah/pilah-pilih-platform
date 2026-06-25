import { useState, useEffect } from 'react';
import { FiShoppingCart, FiPlus, FiEye, FiPrinter } from 'react-icons/fi';
import { getFactorySales, createFactorySale, getInventory } from '../api/pengepulAPI';
import Modal from '../components/UI/Modal';
import PageHeader from '../components/UI/PageHeader';
import { toast } from '../components/UI/Toast';

const STATUS_LABELS = {
  draft: 'Draft', processing: 'Diproses', completed: 'Selesai',
};

const PenjualanPabrik = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [invoiceItem, setInvoiceItem] = useState(null);
  const [form, setForm] = useState({ waste_type: '', weight: '', price_per_kg: '' });
  const [submitting, setSubmitting] = useState(false);

  const totalPenjualan = sales.filter(s => s.status === 'completed').reduce((acc, s) => acc + parseFloat(s.total_price || 0), 0);
  const totalBerat = sales.filter(s => s.status === 'completed').reduce((acc, s) => acc + parseFloat(s.weight || 0), 0);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [salesRes, invRes] = await Promise.all([getFactorySales(), getInventory()]);
      setSales(salesRes.data);
      setInventory(invRes.data);
    } catch {
      setSales([]);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const totalHarga = form.weight && form.price_per_kg
    ? (parseFloat(form.weight) * parseFloat(form.price_per_kg))
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createFactorySale({
        waste_type: form.waste_type,
        weight: parseFloat(form.weight),
        price_per_kg: parseFloat(form.price_per_kg),
      });
      toast.success('Penjualan ke pabrik berhasil dibuat!');
      setShowForm(false);
      setForm({ waste_type: '', weight: '', price_per_kg: '' });
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal buat penjualan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader
        title="Penjualan ke Pabrik"
        subtitle="Catat transaksi penjualan sampah ke pabrik daur ulang"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus /> Buat Transaksi Baru
          </button>
        }
      />

      {/* Stats Row */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="glass-card stat-card" style={{ '--card-accent': '#10B981', '--card-icon-bg': 'rgba(16,185,129,0.12)' }}>
          <div className="stat-card-icon"><FiShoppingCart /></div>
          <h3>Total Transaksi</h3>
          <div className="value">{sales.length}</div>
          <div className="value-sub">Semua status</div>
        </div>
        <div className="glass-card stat-card" style={{ '--card-accent': '#3B82F6', '--card-icon-bg': 'rgba(59,130,246,0.12)' }}>
          <div className="stat-card-icon">⚖️</div>
          <h3>Total Terjual</h3>
          <div className="value">{totalBerat.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</div>
          <div className="value-sub">Kilogram (selesai)</div>
        </div>
        <div className="glass-card stat-card" style={{ '--card-accent': '#F59E0B', '--card-icon-bg': 'rgba(245,158,11,0.12)' }}>
          <div className="stat-card-icon">💰</div>
          <h3>Total Pendapatan</h3>
          <div className="value" style={{ fontSize: 22 }}>Rp {totalPenjualan.toLocaleString('id-ID')}</div>
          <div className="value-sub">Transaksi selesai</div>
        </div>
      </div>

      {/* Tabel Penjualan */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title"><FiShoppingCart /> Riwayat Penjualan</div>
        </div>
        {loading ? (
          <div className="loading-wrap"><div className="spinner"></div><span>Memuat data...</span></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis Sampah</th>
                  <th>Berat (Kg)</th>
                  <th>Harga/Kg</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.waste_type}</td>
                    <td>{parseFloat(item.weight).toLocaleString('id-ID')} Kg</td>
                    <td>Rp {parseFloat(item.price_per_kg).toLocaleString('id-ID')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                      Rp {parseFloat(item.total_price).toLocaleString('id-ID')}
                    </td>
                    <td><span className={`badge ${item.status}`}>{STATUS_LABELS[item.status] || item.status}</span></td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm btn-icon"
                        title="Lihat Invoice"
                        onClick={() => setInvoiceItem(item)}
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr><td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">🏭</div>
                      <h3>Belum Ada Penjualan</h3>
                      <p>Buat transaksi penjualan pertama Anda.</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Buat Transaksi */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Buat Transaksi Penjualan ke Pabrik" size="md">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Jenis Sampah</label>
            <select
              className="input-control"
              value={form.waste_type}
              onChange={e => setForm({ ...form, waste_type: e.target.value })}
              required
            >
              <option value="">— Pilih Jenis —</option>
              {inventory.map(inv => (
                <option key={inv.waste_type} value={inv.waste_type}>
                  {inv.waste_type} (Stok: {parseFloat(inv.weight).toFixed(1)} Kg)
                </option>
              ))}
            </select>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label>Berat Dijual (Kg)</label>
              <input
                type="number" step="0.01" min="0.01" required
                className="input-control"
                placeholder="0.00"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
              />
              {form.waste_type && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Stok tersedia: {inventory.find(i => i.waste_type === form.waste_type)?.weight || 0} Kg
                </div>
              )}
            </div>
            <div className="input-group">
              <label>Harga Jual per Kg (Rp)</label>
              <input
                type="number" min="1" required
                className="input-control"
                placeholder="0"
                value={form.price_per_kg}
                onChange={e => setForm({ ...form, price_per_kg: e.target.value })}
              />
            </div>
          </div>

          {/* Preview Total */}
          {totalHarga > 0 && (
            <div style={{
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 10, padding: '14px 18px', marginBottom: 20,
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Estimasi Total Pembayaran</div>
              <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--success)' }}>
                Rp {totalHarga.toLocaleString('id-ID')}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                {form.weight} Kg × Rp {parseFloat(form.price_per_kg || 0).toLocaleString('id-ID')}/Kg
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Menyimpan...' : '✓ Simpan Transaksi'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </form>
      </Modal>

      {/* Modal Invoice */}
      <Modal isOpen={!!invoiceItem} onClose={() => setInvoiceItem(null)} title="Invoice Penjualan" size="sm">
        {invoiceItem && (
          <div>
            <div className="invoice-header">
              <div className="invoice-title">♻️ PengepulPanel</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                No. Invoice: #SALE-{String(invoiceItem.id).padStart(4, '0')}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {new Date(invoiceItem.created_at).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="info-row mb-16">
              {[
                { label: 'Jenis Sampah', value: invoiceItem.waste_type },
                { label: 'Berat', value: `${parseFloat(invoiceItem.weight).toLocaleString('id-ID')} Kg` },
                { label: 'Harga per Kg', value: `Rp ${parseFloat(invoiceItem.price_per_kg).toLocaleString('id-ID')}` },
                { label: 'Status', value: STATUS_LABELS[invoiceItem.status] || invoiceItem.status },
              ].map(({ label, value }) => (
                <div key={label} className="info-item">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value}</span>
                </div>
              ))}
            </div>
            <div className="invoice-total">
              <div className="invoice-total-label">Total Pembayaran</div>
              <div className="invoice-total-value">Rp {parseFloat(invoiceItem.total_price).toLocaleString('id-ID')}</div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 16 }} onClick={handlePrint}>
              <FiPrinter /> Cetak Invoice
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PenjualanPabrik;
