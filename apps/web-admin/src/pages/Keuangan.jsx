import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { keuanganAPI } from '../services/api';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const bulanLabel = { '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'Mei','06':'Jun','07':'Jul','08':'Agu','09':'Sep','10':'Okt','11':'Nov','12':'Des' };

export default function Keuangan() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ringkasan');
  const [filterTipe, setFilterTipe] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([keuanganAPI.getSummary(), keuanganAPI.getTransactions()]);
      if (s.success) setSummary(s.data);
      if (t.success) setTransactions(t.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredTx = transactions.filter(t => filterTipe ? t.type === filterTipe : true);

  // Buat chart data dari transaksi
  const monthlyMap = {};
  transactions.forEach(t => {
    const bln = new Date(t.created_at).toISOString().slice(0, 7);
    if (!monthlyMap[bln]) monthlyMap[bln] = { bulan: bulanLabel[bln.slice(5)] || bln, pendapatan: 0, pengeluaran: 0 };
    if (t.type === 'credit') monthlyMap[bln].pendapatan += Number(t.amount || 0);
    if (t.type === 'debit') monthlyMap[bln].pengeluaran += Number(t.amount || 0);
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => ({ ...v, saldo: v.pendapatan - v.pengeluaran }));

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}><div className="spinner" style={{ width: 40, height: 40, borderWidth: 4, margin: '0 auto 1rem' }} /><p style={{ color: 'var(--text-muted)' }}>Memuat data keuangan...</p></div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1>💵 Keuangan</h1>
          <p>Ringkasan dan riwayat keuangan sistem</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Saldo User', value: fmt(summary?.total_saldo_user), icon: '👛', bg: '#dcfce7', color: '#0f4c2a' },
          { label: 'Total Penarikan', value: fmt(summary?.total_penarikan), icon: '💳', bg: '#fee2e2', color: '#991b1b' },
          { label: 'Total Pendapatan', value: fmt(summary?.total_pendapatan), icon: '💰', bg: '#fef3c7', color: '#92400e' },
          { label: 'Total Pengeluaran', value: fmt(summary?.total_pengeluaran), icon: '💸', bg: '#dbeafe', color: '#1e40af' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.4rem' }}>{s.icon}</span></div>
            <div className="stat-info"><div className="label">{s.label}</div><div className="value small" style={{ color: s.color }}>{s.value}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'ringkasan' ? 'active' : ''}`} onClick={() => setTab('ringkasan')}>Ringkasan</button>
        <button className={`tab-btn ${tab === 'riwayat' ? 'active' : ''}`} onClick={() => setTab('riwayat')}>Riwayat Transaksi ({transactions.length})</button>
      </div>

      {tab === 'ringkasan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header"><h3>Pendapatan vs Pengeluaran (Bulanan)</h3></div>
            <div className="card-body">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="gPend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                      <linearGradient id="gKel" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(1)}Jt`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Area type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#22c55e" fill="url(#gPend)" strokeWidth={2} />
                    <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#ef4444" fill="url(#gKel)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="empty-state"><div className="icon">📈</div><h3>Belum ada data keuangan</h3></div>}
            </div>
          </div>

          {monthlyData.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Surplus Bulanan</h3></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(1)}Jt`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Bar dataKey="saldo" name="Surplus" fill="#3b82f6" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'riwayat' && (
        <>
          <div className="filter-bar">
            <select className="form-control form-select" style={{ width: 'auto' }} value={filterTipe} onChange={e => setFilterTipe(e.target.value)} id="keuangan-filter-tipe">
              <option value="">Semua Tipe</option>
              <option value="credit">Pemasukan (Credit)</option>
              <option value="debit">Pengeluaran (Debit)</option>
            </select>
          </div>
          <div className="card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>User</th><th>Keterangan</th><th>Tipe</th><th>Nominal</th><th>Tanggal</th></tr>
                </thead>
                <tbody>
                  {filteredTx.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{t.user_name}</td>
                      <td style={{ maxWidth: 200 }}>{t.description || '-'}</td>
                      <td>
                        <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                          {t.type === 'credit' ? '📥 Masuk' : '📤 Keluar'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 900, color: t.type === 'credit' ? 'var(--success)' : 'var(--danger)', fontSize: '1rem' }}>
                        {t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(t.created_at).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {filteredTx.length === 0 && (
                    <tr><td colSpan={5}><div className="empty-state"><div className="icon">💰</div><h3>Belum ada transaksi</h3></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
