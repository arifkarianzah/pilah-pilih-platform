import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { dashboardAPI } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const bulanLabel = {
  '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'Mei',
  '06':'Jun','07':'Jul','08':'Agu','09':'Sep','10':'Okt','11':'Nov','12':'Des'
};

const activityIcons = {
  user_baru:   { icon: '👤', bg: '#dcfce7' },
  penjemputan: { icon: '🚚', bg: '#dbeafe' },
  penarikan:   { icon: '💳', bg: '#fffbeb' },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState({ sampah: [], keuangan: [] });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c, a] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getMonthlyChart(),
          dashboardAPI.getActivity(),
        ]);
        if (s.success) setStats(s.data);
        if (c.success) setChart(c);
        if (a.success) setActivity(a.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Gabungkan data sampah & keuangan per bulan
  const sampahData = (chart.sampah || []).map(d => ({
    bulan: bulanLabel[d.bulan?.slice(5)] || d.bulan,
    masuk: Number(d.total_sampah || 0),
    jemput: Number(d.jumlah_penjemputan || 0),
  }));

  const keuanganData = (chart.keuangan || []).map(d => ({
    bulan: bulanLabel[d.bulan?.slice(5)] || d.bulan,
    pendapatan: Number(d.pendapatan || 0),
    pengeluaran: Number(d.pengeluaran || 0),
    saldo: Number(d.pendapatan || 0) - Number(d.pengeluaran || 0),
  }));

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4, margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Memuat data dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      {/* Hero banner */}
      <div className="gradient-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.82rem', opacity: 0.75, marginBottom: '0.3rem' }}>Selamat datang 👋</p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '0.3rem' }}>
            Dashboard Pilah Pilih
          </h1>
          <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Data real-time dari database
          </p>
        </div>
        <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', fontSize: '5rem', opacity: 0.15 }}>♻️</div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <StatCard icon="👥" label="Total User" value={Number(stats?.total_user || 0).toLocaleString('id-ID')} bg="#dcfce7" color="#0f4c2a" />
        <StatCard icon="🚚" label="Total Petugas" value={stats?.total_petugas || 0} bg="#dbeafe" color="#1e40af" />
        <StatCard icon="♻️" label="Total Pengepul" value={stats?.total_pengepul || 0} bg="#ede9fe" color="#5b21b6" />
        <StatCard icon="🗑️" label="Total Sampah" value={`${Number(stats?.total_sampah || 0).toFixed(0)} kg`} bg="#fef3c7" color="#92400e" />
        <StatCard icon="💳" label="Total Penarikan" value={fmt(stats?.total_penarikan)} bg="#fee2e2" color="#991b1b" />
        <StatCard icon="📦" label="Total Transaksi" value={Number(stats?.total_transaksi || 0).toLocaleString('id-ID')} bg="#dcfce7" color="#0f4c2a" />
        <StatCard icon="💰" label="Total Pendapatan" value={fmt(stats?.total_pendapatan)} bg="#fef3c7" color="#92400e" />
        <StatCard icon="💸" label="Total Pengeluaran" value={fmt(stats?.total_pengeluaran)} bg="#fee2e2" color="#991b1b" />
      </div>

      {/* Charts row 1 */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3>📦 Sampah Masuk (kg)</h3>
            <span className="badge badge-success">6 Bulan Terakhir</span>
          </div>
          <div className="card-body">
            {sampahData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={sampahData}>
                  <defs>
                    <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v} kg`} />
                  <Area type="monotone" dataKey="masuk" name="Sampah Masuk" stroke="#22c55e" fill="url(#colorMasuk)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><div className="icon">📦</div><h3>Belum ada data sampah</h3></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>🚚 Jumlah Penjemputan</h3>
            <span className="badge badge-info">6 Bulan Terakhir</span>
          </div>
          <div className="card-body">
            {sampahData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sampahData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v} order`} />
                  <Bar dataKey="jemput" name="Penjemputan" fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><div className="icon">🚚</div><h3>Belum ada data penjemputan</h3></div>}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3>📊 Pendapatan vs Pengeluaran</h3>
          <span className="badge badge-purple">Keuangan Bulanan</span>
        </div>
        <div className="card-body">
          {keuanganData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={keuanganData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}Jt`} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend />
                <Bar dataKey="pendapatan" name="Pendapatan" fill="#22c55e" radius={[4,4,0,0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><div className="icon">💰</div><h3>Belum ada data keuangan</h3></div>}
        </div>
      </div>

      {/* Aktivitas terbaru */}
      <div className="card">
        <div className="card-header">
          <h3>⚡ Aktivitas Terbaru</h3>
          <span className="badge badge-neutral">Real-time</span>
        </div>
        <div className="card-body" style={{ padding: '0 1.5rem' }}>
          {activity.length > 0 ? (
            <div className="activity-list">
              {activity.map((a, i) => {
                const info = activityIcons[a.tipe] || { icon: '📌', bg: '#f1f5f9' };
                const timeAgo = new Date(a.waktu).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
                return (
                  <div className="activity-item" key={i}>
                    <div className="activity-dot" style={{ background: info.bg }}>{info.icon}</div>
                    <div className="activity-content">
                      <div className="title">
                        {a.tipe === 'user_baru' ? 'User baru mendaftar' :
                         a.tipe === 'penjemputan' ? 'Penjemputan selesai' : 'Penarikan saldo baru'}
                      </div>
                      <div className="sub">{a.deskripsi}</div>
                    </div>
                    <div className="activity-time">{timeAgo}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="icon">📭</div>
              <h3>Belum ada aktivitas</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
