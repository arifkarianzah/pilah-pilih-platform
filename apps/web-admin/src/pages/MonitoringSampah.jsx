import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { sampahAPI } from '../services/api';

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#06b6d4','#ef4444','#ec4899','#94a3b8'];

const weekDays = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

export default function MonitoringSampah() {
  const [data, setData] = useState({ byType: [], today: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await sampahAPI.getMonitoring();
      if (res.success) setData({ byType: res.byType, today: res.today });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = data.byType.reduce((s, d) => s + Number(d.total_kg || 0), 0);
  const todayTotal = data.today.reduce((s, d) => s + Number(d.actual_weight || 0), 0);

  const pieData = data.byType.map((d, i) => ({
    name: d.waste_type,
    value: Number(d.total_kg || 0),
    color: COLORS[i % COLORS.length],
  }));

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}><div className="spinner" style={{ width: 40, height: 40, borderWidth: 4, margin: '0 auto 1rem' }} /><p style={{ color: 'var(--text-muted)' }}>Memuat data...</p></div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1>📦 Monitoring Sampah</h1>
          <p>Pantau alur sampah dari user → petugas → pengepul</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Sampah Masuk', value: `${Number(total).toFixed(1)} kg`, icon: '⚖️', bg: '#dcfce7', color: '#0f4c2a' },
          { label: 'Sampah Hari Ini', value: `${Number(todayTotal).toFixed(1)} kg`, icon: '📅', bg: '#dbeafe', color: '#1e40af' },
          { label: 'Jenis Terbanyak', value: data.byType[0]?.waste_type || '-', icon: '🏆', bg: '#fef3c7', color: '#92400e' },
          { label: 'Entri Hari Ini', value: data.today.length, icon: '📦', bg: '#ede9fe', color: '#5b21b6' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.4rem' }}>{s.icon}</span></div>
            <div className="stat-info">
              <div className="label">{s.label}</div>
              <div className={`value ${String(s.value).length > 8 ? 'small' : ''}`} style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Total Sampah per Jenis</h3></div>
          <div className="card-body">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} kg`} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><div className="icon">📊</div><h3>Belum ada data</h3></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Rincian Per Jenis Sampah</h3></div>
          <div className="card-body">
            {data.byType.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {data.byType.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{d.waste_type}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{d.jumlah || 0} transaksi</div>
                    </div>
                    <div style={{ fontWeight: 900, color: COLORS[i % COLORS.length], fontSize: '0.9rem' }}>
                      {Number(d.total_kg || 0).toFixed(1)} kg
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state"><div className="icon">📦</div><h3>Belum ada data sampah</h3></div>}
          </div>
        </div>
      </div>

      {/* Hari ini */}
      <div className="card">
        <div className="card-header">
          <h3>🌅 Sampah Masuk Hari Ini</h3>
          <span className="badge badge-success">{data.today.length} entri</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Waktu</th><th>Jenis</th><th>Berat</th><th>User</th><th>Petugas</th></tr>
            </thead>
            <tbody>
              {data.today.length > 0 ? data.today.map((h, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                    {new Date(h.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td><strong>{h.waste_type}</strong></td>
                  <td style={{ fontWeight: 800, color: 'var(--brand)' }}>{Number(h.actual_weight || 0).toFixed(1)} kg</td>
                  <td>{h.user_name || '-'}</td>
                  <td>{h.petugas_name || '-'}</td>
                </tr>
              )) : (
                <tr><td colSpan={5}><div className="empty-state" style={{ padding: '2rem' }}><div className="icon">🌅</div><h3>Belum ada sampah masuk hari ini</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
