import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiInbox, FiUpload, FiActivity, FiDollarSign,
  FiArrowUp, FiBox, FiTruck, FiAlertCircle
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { getDashboardStats, getMonthlyData, getNotifications } from '../api/pengepulAPI';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, unit, accent, iconBg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg, color: accent }}>{icon}</div>
    <div className="stat-info">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {unit && <div className="value-sub">{unit}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [profitChart, setProfitChart] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, monthlyRes, notifRes] = await Promise.all([
          getDashboardStats(),
          getMonthlyData(),
          getNotifications(),
        ]);
        setStats(statsRes.data);
        setMonthlyChart(monthlyRes.data?.monthlyData || []);
        setProfitChart(monthlyRes.data?.profitData || []);
        setNotifs(notifRes.data?.notifications?.slice(0, 5) || []);
      } catch (error) {
        console.error("Dashboard API Error:", error);
        setStats({ totalMasuk: 0, totalKeluar: 0, totalTransaksi: 0, totalKeuntungan: 0 });
        setMonthlyChart([]);
        setProfitChart([]);
        setNotifs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner"></div>
        <span>Memuat data dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      icon: <FiInbox />,
      label: 'Total Sampah Masuk',
      value: `${Number(stats?.totalMasuk || 0).toLocaleString('id-ID')}`,
      unit: 'Kilogram',
      accent: '#10B981',
      iconBg: 'rgba(16,185,129,0.12)',
    },
    {
      icon: <FiUpload />,
      label: 'Total Sampah Keluar',
      value: `${Number(stats?.totalKeluar || 0).toLocaleString('id-ID')}`,
      unit: 'Kilogram',
      accent: '#3B82F6',
      iconBg: 'rgba(59,130,246,0.12)',
    },
    {
      icon: <FiActivity />,
      label: 'Total Transaksi',
      value: stats?.totalTransaksi || 0,
      unit: 'Transaksi ke Pabrik',
      accent: '#8B5CF6',
      iconBg: 'rgba(139,92,246,0.12)',
    },
    {
      icon: <FiDollarSign />,
      label: 'Total Keuntungan',
      value: `Rp ${Number(stats?.totalKeuntungan || 0).toLocaleString('id-ID')}`,
      unit: 'Estimasi Laba Bersih',
      accent: '#F59E0B',
      iconBg: 'rgba(245,158,11,0.12)',
    },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div className="dashboard-grid">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Bar Chart Sampah */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><FiBox /> Alur Sampah Bulanan (Kg)</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyChart} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10 }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Bar dataKey="Masuk" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Keluar" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart Keuntungan */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><FiArrowUp /> Tren Keuntungan (Rp)</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={profitChart}>
              <defs>
                <linearGradient id="labaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} tickFormatter={v => `${v / 1000000}M`} />
              <Tooltip
                formatter={v => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Laba']}
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10 }}
              />
              <Area type="monotone" dataKey="Laba" stroke="#10B981" strokeWidth={2.5} fill="url(#labaGrad)" dot={{ r: 4, fill: '#10B981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-row">
        {/* Quick Actions */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><FiActivity /> Aksi Cepat</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { to: '/sampah-masuk', icon: '📥', label: 'Cek Kiriman Baru', color: '#F59E0B' },
              { to: '/inventori', icon: '📦', label: 'Cek Stok', color: '#10B981' },
              { to: '/penjualan-pabrik', icon: '🏭', label: 'Jual ke Pabrik', color: '#3B82F6' },
              { to: '/keuangan', icon: '💰', label: 'Laporan Keuangan', color: '#8B5CF6' },
              { to: '/kiriman-petugas', icon: '🚚', label: 'Performa Petugas', color: '#F97316' },
              { to: '/laporan', icon: '📊', label: 'Buat Laporan', color: '#EC4899' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '18px 12px', borderRadius: 12, textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                  transition: 'all 0.2s', color: 'var(--text-main)',
                  fontSize: 13, fontWeight: 600, textAlign: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <span style={{ fontSize: 28 }}>{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Notifikasi Terbaru */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title"><FiAlertCircle /> Notifikasi Terbaru</div>
            <Link to="/notifikasi" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Lihat Semua →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {notifs.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tidak ada notifikasi terbaru.</p>
            )}
            {notifs.map(n => (
              <div key={n.id} style={{
                padding: '10px 14px', borderRadius: 10,
                background: n.is_read ? 'transparent' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${n.is_read ? 'var(--border)' : 'rgba(16,185,129,0.2)'}`,
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{n.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.4 }}>{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
