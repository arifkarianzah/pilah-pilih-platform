import { useState, useEffect } from 'react';
import { FiFileText, FiDownload, FiFilter } from 'react-icons/fi';
import { getFactorySales, getIncomingWaste } from '../api/pengepulAPI';
import PageHeader from '../components/UI/PageHeader';

const PERIOD_OPTIONS = [
  { key: 'harian', label: 'Hari Ini' },
  { key: 'mingguan', label: 'Minggu Ini' },
  { key: 'bulanan', label: 'Bulan Ini' },
  { key: 'semua', label: 'Semua' },
];

const REPORT_TABS = [
  { key: 'sampah', label: '📦 Laporan Sampah' },
  { key: 'keuangan', label: '💰 Laporan Keuangan' },
];

const Laporan = () => {
  const [sales, setSales] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('bulanan');
  const [reportTab, setReportTab] = useState('sampah');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [salesRes, incomingRes] = await Promise.all([
          getFactorySales(),
          getIncomingWaste(),
        ]);
        setSales(salesRes.data);
        setIncoming(incomingRes.data);
      } catch {
        setSales([]);
        setIncoming([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterByPeriod = (items, dateField = 'created_at') => {
    const now = new Date();
    return items.filter(item => {
      const d = new Date(item[dateField]);
      if (period === 'harian') return d.toDateString() === now.toDateString();
      if (period === 'mingguan') {
        const weekAgo = new Date(now - 7 * 86400000);
        return d >= weekAgo;
      }
      if (period === 'bulanan') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const filteredSales = filterByPeriod(sales);
  const filteredIncoming = filterByPeriod(incoming);

  const totalPenjualan = filteredSales.reduce((acc, s) => acc + parseFloat(s.total_price || 0), 0);
  const totalBerat = filteredSales.reduce((acc, s) => acc + parseFloat(s.weight || 0), 0);
  const totalMasuk = filteredIncoming.filter(i => i.status === 'received_by_pengepul')
    .reduce((acc, i) => acc + parseFloat(i.actual_weight || 0), 0);

  // Export CSV
  const exportCSV = () => {
    const data = reportTab === 'keuangan' ? filteredSales : filteredIncoming;
    if (data.length === 0) return;
    const headers = reportTab === 'keuangan'
      ? ['Tanggal', 'Jenis', 'Berat (Kg)', 'Harga/Kg', 'Total', 'Status']
      : ['Tanggal', 'Warga', 'Petugas', 'Jenis', 'Berat (Kg)', 'Status'];
    const rows = data.map(item => reportTab === 'keuangan'
      ? [new Date(item.created_at).toLocaleDateString('id-ID'), item.waste_type, item.weight, item.price_per_kg, item.total_price, item.status]
      : [new Date(item.created_at).toLocaleDateString('id-ID'), item.nama_warga, item.nama_petugas, item.waste_type, item.actual_weight, item.status]
    );
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_${reportTab}_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => window.print();

  return (
    <div>
      <PageHeader
        title="Laporan"
        subtitle="Generate dan download laporan sampah & keuangan"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
              <FiDownload /> Export CSV
            </button>
            <button className="btn btn-primary btn-sm" onClick={exportPDF}>
              <FiDownload /> Export PDF
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
          <FiFilter /> Periode:
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {PERIOD_OPTIONS.map(p => (
            <button key={p.key} className={`tab-btn ${period === p.key ? 'active' : ''}`} onClick={() => setPeriod(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="tabs" style={{ width: '100%', marginBottom: 24 }}>
        {REPORT_TABS.map(t => (
          <button key={t.key} className={`tab-btn ${reportTab === t.key ? 'active' : ''}`} onClick={() => setReportTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary Boxes */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        {reportTab === 'sampah' ? (
          <>
            <div className="glass-card stat-card" style={{ '--card-accent': '#10B981', '--card-icon-bg': 'rgba(16,185,129,0.12)' }}>
              <div className="stat-card-icon">📥</div>
              <h3>Sampah Masuk</h3>
              <div className="value">{totalMasuk.toFixed(1)}</div>
              <div className="value-sub">Kg diterima</div>
            </div>
            <div className="glass-card stat-card" style={{ '--card-accent': '#3B82F6', '--card-icon-bg': 'rgba(59,130,246,0.12)' }}>
              <div className="stat-card-icon">📤</div>
              <h3>Sampah Keluar</h3>
              <div className="value">{totalBerat.toFixed(1)}</div>
              <div className="value-sub">Kg terjual</div>
            </div>
            <div className="glass-card stat-card" style={{ '--card-accent': '#8B5CF6', '--card-icon-bg': 'rgba(139,92,246,0.12)' }}>
              <div className="stat-card-icon">🔢</div>
              <h3>Total Kiriman</h3>
              <div className="value">{filteredIncoming.length}</div>
              <div className="value-sub">Kiriman periode ini</div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-card stat-card" style={{ '--card-accent': '#10B981', '--card-icon-bg': 'rgba(16,185,129,0.12)' }}>
              <div className="stat-card-icon">💰</div>
              <h3>Total Penjualan</h3>
              <div className="value" style={{ fontSize: 18 }}>Rp {totalPenjualan.toLocaleString('id-ID')}</div>
              <div className="value-sub">Periode ini</div>
            </div>
            <div className="glass-card stat-card" style={{ '--card-accent': '#F59E0B', '--card-icon-bg': 'rgba(245,158,11,0.12)' }}>
              <div className="stat-card-icon">📊</div>
              <h3>Berat Terjual</h3>
              <div className="value">{totalBerat.toFixed(1)}</div>
              <div className="value-sub">Kilogram</div>
            </div>
            <div className="glass-card stat-card" style={{ '--card-accent': '#EF4444', '--card-icon-bg': 'rgba(239,68,68,0.12)' }}>
              <div className="stat-card-icon">🧾</div>
              <h3>Jumlah Transaksi</h3>
              <div className="value">{filteredSales.length}</div>
              <div className="value-sub">Transaksi penjualan</div>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title"><FiFileText /> Detail {reportTab === 'sampah' ? 'Sampah Masuk' : 'Penjualan'}</div>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {(reportTab === 'sampah' ? filteredIncoming : filteredSales).length} data
          </span>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner"></div><span>Memuat laporan...</span></div>
        ) : reportTab === 'keuangan' ? (
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Tanggal</th><th>Jenis Sampah</th><th>Berat (Kg)</th><th>Harga/Kg</th><th>Total</th><th>Status</th>
              </tr></thead>
              <tbody>
                {filteredSales.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td style={{ fontWeight: 600 }}>{item.waste_type}</td>
                    <td>{parseFloat(item.weight).toFixed(1)} Kg</td>
                    <td>Rp {parseFloat(item.price_per_kg).toLocaleString('id-ID')}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>Rp {parseFloat(item.total_price).toLocaleString('id-ID')}</td>
                    <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                  </tr>
                ))}
                {filteredSales.length === 0 && <tr><td colSpan="6"><div className="empty-state"><div className="empty-state-icon">📋</div><h3>Tidak ada data</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Tanggal</th><th>Warga</th><th>Petugas</th><th>Jenis</th><th>Berat (Kg)</th><th>Status</th>
              </tr></thead>
              <tbody>
                {filteredIncoming.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td style={{ fontWeight: 600 }}>{item.nama_warga || '-'}</td>
                    <td>{item.nama_petugas || '-'}</td>
                    <td>{item.waste_type}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.actual_weight} Kg</td>
                    <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                  </tr>
                ))}
                {filteredIncoming.length === 0 && <tr><td colSpan="6"><div className="empty-state"><div className="empty-state-icon">📋</div><h3>Tidak ada data</h3></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporan;
