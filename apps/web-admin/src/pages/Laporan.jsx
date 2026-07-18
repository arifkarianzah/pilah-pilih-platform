import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI, userAPI, petugasAPI, pengepulAPI, keuanganAPI } from '../services/api';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const bulanLabel = { '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'Mei','06':'Jun','07':'Jul','08':'Agu','09':'Sep','10':'Okt','11':'Nov','12':'Des' };

export default function Laporan() {
  const [tab, setTab] = useState('user');
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [petugas, setPetugas] = useState([]);
  const [pengepul, setPengepul] = useState([]);
  const [keuangan, setKeuangan] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, c, p, pg, k] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getMonthlyChart(),
        petugasAPI.getAll(),
        pengepulAPI.getAll(),
        keuanganAPI.getSummary(),
      ]);
      if (s.success) setStats(s.data);
      if (c.success) {
        const userChartData = (c.sampah || []).map(d => ({
          bulan: bulanLabel[d.bulan?.slice(5)] || d.bulan,
          user: Number(d.jumlah_penjemputan || 0),
        }));
        setChart(userChartData);
      }
      if (p.success) setPetugas(p.data);
      if (pg.success) setPengepul(pg.data);
      if (k.success) setKeuangan(k.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleExport = (type) => {
    alert(`Fitur export ${type} akan segera tersedia!`);
  };

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}><div className="spinner" style={{ width: 40, height: 40, borderWidth: 4, margin: '0 auto 1rem' }} /><p style={{ color: 'var(--text-muted)' }}>Memuat laporan...</p></div>
    </div>
  );

  const topPetugas = [...petugas].sort((a, b) => Number(b.total_order || 0) - Number(a.total_order || 0));
  const topPengepul = [...pengepul].sort((a, b) => Number(b.total_sampah || 0) - Number(a.total_sampah || 0));
  const maxOrder = topPetugas[0] ? Number(topPetugas[0].total_order || 1) : 1;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1>📊 Laporan</h1>
          <p>Laporan dan ekspor data sistem</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost" onClick={() => handleExport('PDF')} id="export-pdf-btn"><Download size={16} /> Export PDF</button>
          <button className="btn btn-primary" onClick={() => handleExport('Excel')} id="export-excel-btn"><Download size={16} /> Export Excel</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['user','petugas','pengepul','keuangan'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} id={`laporan-tab-${t}`}>
            {t === 'user' ? '👥 User' : t === 'petugas' ? '🚚 Petugas' : t === 'pengepul' ? '♻️ Pengepul' : '💰 Keuangan'}
          </button>
        ))}
      </div>

      {/* User */}
      {tab === 'user' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-2">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7' }}><span style={{ fontSize: '1.4rem' }}>👥</span></div>
              <div className="stat-info">
                <div className="label">Total User Terdaftar</div>
                <div className="value">{Number(stats?.total_user || 0).toLocaleString('id-ID')}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe' }}><span style={{ fontSize: '1.4rem' }}>📦</span></div>
              <div className="stat-info">
                <div className="label">Total Transaksi Penjemputan</div>
                <div className="value">{Number(stats?.total_transaksi || 0).toLocaleString('id-ID')}</div>
              </div>
            </div>
          </div>
          {chart.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Order Penjemputan per Bulan</h3></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="user" name="Order Penjemputan" fill="#0f4c2a" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Petugas */}
      {tab === 'petugas' && (
        <div className="card">
          <div className="card-header"><h3>Performa Petugas</h3></div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Nama Petugas</th><th>Total Order</th><th>Total Sampah</th><th>Saldo</th><th>Performa</th></tr>
              </thead>
              <tbody>
                {topPetugas.length > 0 ? topPetugas.map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="avatar avatar-sm" style={{ background: `hsl(${i * 80}, 55%, 35%)` }}>{p.name?.[0]}</div>
                        <span style={{ fontWeight: 700 }}>{p.name}</span>
                        {i === 0 && <span>🏆</span>}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.total_order || 0}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{Number(p.total_sampah || 0).toFixed(1)} kg</td>
                    <td>{fmt(p.saldo)}</td>
                    <td>
                      <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-full)', height: 8, width: 120 }}>
                        <div style={{ background: 'var(--primary)', borderRadius: 'var(--radius-full)', height: 8, width: `${Math.round(Number(p.total_order || 0) / maxOrder * 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5}><div className="empty-state"><div className="icon">🚚</div><h3>Belum ada data petugas</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pengepul */}
      {tab === 'pengepul' && (
        <div className="card">
          <div className="card-header"><h3>Laporan Pengepul</h3></div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Nama Pengepul</th><th>Perusahaan</th><th>Sampah Diterima</th><th>Total Transaksi</th></tr>
              </thead>
              <tbody>
                {topPengepul.length > 0 ? topPengepul.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.name}</td>
                    <td>{p.company_name || '-'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{Number(p.total_sampah || 0).toFixed(1)} kg</td>
                    <td style={{ fontWeight: 700 }}>{p.total_transaksi || 0} transaksi</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4}><div className="empty-state"><div className="icon">♻️</div><h3>Belum ada data pengepul</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Keuangan */}
      {tab === 'keuangan' && keuangan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-3">
            {[
              { label: 'Total Pemasukan', value: fmt(keuangan.total_pendapatan), icon: '💰', color: '#0f4c2a', bg: '#dcfce7' },
              { label: 'Total Pengeluaran', value: fmt(keuangan.total_pengeluaran), icon: '💸', color: '#991b1b', bg: '#fee2e2' },
              { label: 'Surplus', value: fmt(Number(keuangan.total_pendapatan || 0) - Number(keuangan.total_pengeluaran || 0)), icon: '📈', color: '#1e40af', bg: '#dbeafe' },
            ].map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.4rem' }}>{s.icon}</span></div>
                <div className="stat-info"><div className="label">{s.label}</div><div className="value small" style={{ color: s.color }}>{s.value}</div></div>
              </div>
            ))}
          </div>
          <div className="card card-padded">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>Rasio Pengeluaran dari Pendapatan</p>
            <div style={{ fontSize: '2rem', fontWeight: 900 }}>
              {keuangan.total_pendapatan > 0 ? Math.round(Number(keuangan.total_pengeluaran) / Number(keuangan.total_pendapatan) * 100) : 0}%
            </div>
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-full)', height: 16, overflow: 'hidden', marginTop: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(90deg, #22c55e, #0f4c2a)', height: '100%',
                width: `${keuangan.total_pendapatan > 0 ? Math.min(100, Math.round(Number(keuangan.total_pengeluaran) / Number(keuangan.total_pendapatan) * 100)) : 0}%`,
                borderRadius: 'var(--radius-full)', transition: 'width 1s ease'
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
