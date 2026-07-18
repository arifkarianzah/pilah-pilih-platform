import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';
import { getKeuangan, getFactorySales, getIncomingWaste } from '../api/pengepulAPI';
import PageHeader from '../components/UI/PageHeader';

const TAB_KEYS = ['semua', 'penjualan', 'pembelian', 'operasional'];
const TAB_LABELS = { semua: 'Semua', penjualan: 'Penjualan', pembelian: 'Pembelian', operasional: 'Operasional' };

const Keuangan = () => {
  const [keuangan, setKeuangan] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('semua');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kRes, salesRes] = await Promise.all([
        getKeuangan(),
        getFactorySales(),
      ]);
      setKeuangan(kRes.data);
      // Format sales as riwayat
      const formattedSales = salesRes.data.map(s => ({
        id: s.id,
        type: 'penjualan',
        keterangan: `Jual ${s.waste_type} ke pabrik`,
        jumlah: parseFloat(s.total_price),
        tanggal: s.created_at,
      }));
      setRiwayat(formattedSales);
    } catch {
      setKeuangan({ totalPembelian: 0, totalPenjualan: 0, totalLaba: 0, totalPengeluaran: 0 });
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredRiwayat = riwayat.filter(r => activeTab === 'semua' || r.type === activeTab);

  const statCards = [
    { label: 'Total Penjualan', value: keuangan?.totalPenjualan || 0, icon: <FiTrendingUp />, accent: '#10B981', iconBg: 'rgba(16,185,129,0.12)', prefix: 'Rp' },
    { label: 'Total Pembelian', value: keuangan?.totalPembelian || 0, icon: <FiTrendingDown />, accent: '#3B82F6', iconBg: 'rgba(59,130,246,0.12)', prefix: 'Rp' },
    { label: 'Total Laba', value: keuangan?.totalLaba || (keuangan?.totalPenjualan - keuangan?.totalPembelian) || 0, icon: <FiDollarSign />, accent: '#F59E0B', iconBg: 'rgba(245,158,11,0.12)', prefix: 'Rp', highlight: true },
    { label: 'Pengeluaran Operasional', value: keuangan?.totalPengeluaran || 0, icon: '📋', accent: '#EF4444', iconBg: 'rgba(239,68,68,0.12)', prefix: 'Rp' },
  ];

  return (
    <div>
      <PageHeader
        title="Laporan Keuangan"
        subtitle="Ringkasan pemasukan, pengeluaran dan laba pengepul"
        action={
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            <FiRefreshCw /> Refresh
          </button>
        }
      />

      {/* Stat Cards */}
      <div className="dashboard-grid" style={{ marginBottom: 28 }}>
        {statCards.map((card, i) => (
          <div key={i} className="glass-card stat-card" style={{ '--card-accent': card.accent, '--card-icon-bg': card.iconBg }}>
            <div className="stat-card-icon">{card.icon}</div>
            <h3>{card.label}</h3>
            <div className="value" style={{ fontSize: 20, color: card.highlight ? 'var(--warning)' : 'var(--text-main)' }}>
              {card.prefix} {Number(card.value).toLocaleString('id-ID')}
            </div>
          </div>
        ))}
      </div>

      {/* Laba Analisis per Jenis Sampah */}
      <div className="glass-card mb-24">
        <div className="card-header">
          <div className="card-title">💡 Analisis Keuntungan per Jenis Sampah</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {(keuangan?.analisisKeuntungan || []).map(item => {
            const laba = (item.jual - item.beli) * item.masuk;
            return (
              <div key={item.jenis} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{item.emoji}</span>
                  <strong>{item.jenis}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Stok Masuk</span>
                    <span style={{ fontWeight: 600 }}>{item.masuk} Kg</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Harga Beli</span>
                    <span>Rp {item.beli.toLocaleString('id-ID')}/Kg</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Harga Jual</span>
                    <span>Rp {item.jual.toLocaleString('id-ID')}/Kg</span>
                  </div>
                  <hr className="divider" style={{ margin: '6px 0' }} />
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Estimasi Laba</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                      Rp {laba.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {(!keuangan?.analisisKeuntungan || keuangan.analisisKeuntungan.length === 0) && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '10px 0' }}>Belum ada data riwayat sampah masuk.</div>
          )}
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title"><FiDollarSign /> Riwayat Transaksi</div>
        </div>

        <div className="tabs" style={{ marginBottom: 20 }}>
          {TAB_KEYS.map(key => (
            <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner"></div><span>Memuat data...</span></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Tipe</th>
                  <th style={{ textAlign: 'right' }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiwayat.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>{item.keterangan}</td>
                    <td>
                      <span className={`badge ${item.type === 'penjualan' ? 'completed' : item.type === 'operasional' ? 'rejected_by_pengepul' : 'pending'}`}>
                        {TAB_LABELS[item.type] || item.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: item.jumlah > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {item.jumlah > 0 ? '+' : ''}Rp {Math.abs(item.jumlah).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
                {filteredRiwayat.length === 0 && (
                  <tr><td colSpan="4">
                    <div className="empty-state">
                      <div className="empty-state-icon">💸</div>
                      <h3>Belum ada riwayat</h3>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Keuangan;
