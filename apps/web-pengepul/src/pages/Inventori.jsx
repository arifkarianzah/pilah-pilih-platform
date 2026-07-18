import { useState, useEffect } from 'react';
import { FiBox, FiEdit, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { getInventory, updateInventory } from '../api/pengepulAPI';
import Modal from '../components/UI/Modal';
import PageHeader from '../components/UI/PageHeader';
import { toast } from '../components/UI/Toast';

const WASTE_ICONS = {
  'Besi': '🔩', 'Kardus': '📦', 'Plastik PET': '🍾',
  'Plastik Campur': '🛍️', 'Aluminium': '🥫', 'Kaca': '🫙',
  'Kaleng': '🥤', 'Kertas': '📰',
};

const MIN_STOCK = 50; // Kg minimum stok sebelum warning

const Inventori = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'koreksi' | 'tambah'
  const [selected, setSelected] = useState(null);
  const [inputWeight, setInputWeight] = useState('');
  const [inputWasteType, setInputWasteType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getInventory();
      setInventory(res.data || []);
    } catch {
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalWeight = inventory.reduce((acc, i) => acc + parseFloat(i.weight || 0), 0);
  const maxWeight = Math.max(...inventory.map(i => parseFloat(i.weight || 0)), 1);
  const lowStock = inventory.filter(i => parseFloat(i.weight) < MIN_STOCK);

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    setInputWeight(type === 'koreksi' ? item?.weight || '' : '');
    setInputWasteType(item?.waste_type || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateInventory(inputWasteType, parseFloat(inputWeight));
      toast.success(modalType === 'koreksi' ? 'Stok berhasil dikoreksi!' : 'Stok berhasil ditambahkan!');
      setModalType(null);
      fetchData();
    } catch {
      toast.error('Gagal update stok. Mode offline.');
      setInventory(prev => {
        const found = prev.find(i => i.waste_type === inputWasteType);
        if (found) {
          const newW = modalType === 'koreksi' ? parseFloat(inputWeight) : parseFloat(found.weight) + parseFloat(inputWeight);
          return prev.map(i => i.waste_type === inputWasteType ? { ...i, weight: newW } : i);
        }
        return [...prev, { id: Date.now(), waste_type: inputWasteType, weight: parseFloat(inputWeight), updated_at: new Date().toISOString() }];
      });
      setModalType(null);
    } finally {
      setSubmitting(false);
    }
  };

  const WASTE_TYPES = ['Besi', 'Kardus', 'Plastik PET', 'Plastik Campur', 'Aluminium', 'Kaca', 'Kaleng', 'Kertas'];

  return (
    <div>
      <PageHeader
        title="Inventori Sampah"
        subtitle="Kelola stok sampah di gudang Anda"
        action={
          <button className="btn btn-primary" onClick={() => openModal('tambah')}>
            <FiPlus /> Tambah Stok
          </button>
        }
      />

      {/* Warning Stok Menipis */}
      {lowStock.length > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <FiAlertTriangle style={{ color: 'var(--warning)', fontSize: 20, flexShrink: 0 }} />
          <span style={{ fontSize: 13 }}>
            <strong style={{ color: 'var(--warning)' }}>Stok Menipis!</strong>{' '}
            {lowStock.map(i => i.waste_type).join(', ')} di bawah {MIN_STOCK} Kg.
          </span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="glass-card stat-card" style={{ '--card-accent': '#10B981', '--card-icon-bg': 'rgba(16,185,129,0.12)' }}>
          <div className="stat-card-icon"><FiBox /></div>
          <h3>Total Jenis Sampah</h3>
          <div className="value">{inventory.length}</div>
          <div className="value-sub">Jenis di gudang</div>
        </div>
        <div className="glass-card stat-card" style={{ '--card-accent': '#3B82F6', '--card-icon-bg': 'rgba(59,130,246,0.12)' }}>
          <div className="stat-card-icon">⚖️</div>
          <h3>Total Berat Stok</h3>
          <div className="value">{totalWeight.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</div>
          <div className="value-sub">Kilogram</div>
        </div>
        <div className="glass-card stat-card" style={{ '--card-accent': '#F59E0B', '--card-icon-bg': 'rgba(245,158,11,0.12)' }}>
          <div className="stat-card-icon"><FiAlertTriangle /></div>
          <h3>Stok Menipis</h3>
          <div className="value" style={{ color: lowStock.length > 0 ? 'var(--warning)' : 'var(--success)' }}>{lowStock.length}</div>
          <div className="value-sub">Di bawah {MIN_STOCK} Kg</div>
        </div>
      </div>

      {/* Inventory Cards */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner"></div><span>Memuat inventori...</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inventory.map(item => {
            const w = parseFloat(item.weight || 0);
            const pct = Math.min((w / maxWeight) * 100, 100);
            const isLow = w < MIN_STOCK;
            const barCls = isLow ? 'danger' : w < MIN_STOCK * 2 ? 'warning' : '';
            return (
              <div key={item.id} className="glass-card" style={{ padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, fontSize: 24,
                    background: isLow ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    border: `1px solid ${isLow ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`
                  }}>
                    {WASTE_ICONS[item.waste_type] || '♻️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{item.waste_type}</span>
                        {isLow && <span className="badge pending" style={{ marginLeft: 8, fontSize: 10 }}>Stok Menipis</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 18, color: isLow ? 'var(--danger)' : 'var(--primary)' }}>
                          {w.toLocaleString('id-ID', { maximumFractionDigits: 1 })} Kg
                        </span>
                        <button className="btn btn-secondary btn-sm btn-icon" title="Koreksi Stok" onClick={() => openModal('koreksi', item)}>
                          <FiEdit />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="progress-bar-wrap">
                        <div className={`progress-bar-fill ${barCls}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
                      Update: {new Date(item.updated_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {inventory.length === 0 && (
            <div className="empty-state glass-card">
              <div className="empty-state-icon">📦</div>
              <h3>Inventori Kosong</h3>
              <p>Belum ada stok sampah. Terima kiriman dari petugas dulu.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Koreksi/Tambah */}
      <Modal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        title={modalType === 'koreksi' ? `Koreksi Stok — ${selected?.waste_type}` : 'Tambah Stok Manual'}
        size="sm"
      >
        <form onSubmit={handleSubmit}>
          {modalType === 'tambah' && (
            <div className="input-group">
              <label>Jenis Sampah</label>
              <select className="input-control" value={inputWasteType} onChange={e => setInputWasteType(e.target.value)} required>
                <option value="">— Pilih Jenis —</option>
                {WASTE_TYPES.map(wt => <option key={wt} value={wt}>{wt}</option>)}
              </select>
            </div>
          )}
          <div className="input-group">
            <label>
              {modalType === 'koreksi' ? 'Berat Baru (Kg)' : 'Berat Ditambahkan (Kg)'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="input-control"
              value={inputWeight}
              onChange={e => setInputWeight(e.target.value)}
              placeholder="Masukkan berat..."
            />
          </div>
          {modalType === 'koreksi' && (
            <div style={{ background: 'rgba(59,130,246,0.08)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              Stok saat ini: <strong style={{ color: 'var(--text-main)' }}>{selected?.weight} Kg</strong>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Menyimpan...' : '✓ Simpan'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setModalType(null)}>Batal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventori;
