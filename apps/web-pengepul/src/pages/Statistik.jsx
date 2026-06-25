import { useState } from 'react';
import { FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import PageHeader from '../components/UI/PageHeader';

const MONTHLY_DATA = [
  { name: 'Jan', Masuk: 320, Keluar: 210 },
  { name: 'Feb', Masuk: 410, Keluar: 290 },
  { name: 'Mar', Masuk: 380, Keluar: 340 },
  { name: 'Apr', Masuk: 520, Keluar: 400 },
  { name: 'Mei', Masuk: 460, Keluar: 380 },
  { name: 'Jun', Masuk: 550, Keluar: 470 },
];

const PROFIT_DATA = [
  { name: 'Jan', Laba: 1200000 },
  { name: 'Feb', Laba: 1800000 },
  { name: 'Mar', Laba: 2100000 },
  { name: 'Apr', Laba: 1600000 },
  { name: 'Mei', Laba: 2400000 },
  { name: 'Jun', Laba: 2900000 },
];

const PIE_DATA = [
  { name: 'Besi', value: 500, color: '#10B981' },
  { name: 'Kardus', value: 300, color: '#3B82F6' },
  { name: 'Plastik PET', value: 250, color: '#8B5CF6' },
  { name: 'Aluminium', value: 120, color: '#F59E0B' },
  { name: 'Kertas', value: 80, color: '#EC4899' },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10 },
  itemStyle: { color: 'var(--text-main)' },
  labelStyle: { color: 'var(--text-muted)' },
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  ) : null;
};

const Statistik = () => {
  const [period, setPeriod] = useState('6bulan');

  return (
    <div>
      <PageHeader
        title="Statistik & Grafik"
        subtitle="Analisis visual performa pengepul"
        action={
          <div className="tabs" style={{ margin: 0 }}>
            {['6bulan', '3bulan', '1bulan'].map(p => (
              <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p === '6bulan' ? '6 Bulan' : p === '3bulan' ? '3 Bulan' : '1 Bulan'}
              </button>
            ))}
          </div>
        }
      />

      {/* Row 1: Bar Chart + Pie Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>
        {/* Bar Chart Sampah */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><FiBarChart2 /> Alur Sampah Bulanan (Kg)</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Masuk" fill="#F59E0B" radius={[5, 5, 0, 0]} name="Sampah Masuk" />
              <Bar dataKey="Keluar" fill="#10B981" radius={[5, 5, 0, 0]} name="Sampah Keluar" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart Jenis Sampah */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">🥧 Jenis Sampah Terbanyak</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={CustomPieLabel}>
                {PIE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value) => [`${value} Kg`, 'Stok']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {PIE_DATA.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }}></div>
                <span style={{ flex: 1, color: 'var(--text-soft)' }}>{item.name}</span>
                <span style={{ fontWeight: 600 }}>{item.value} Kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Area Chart Keuntungan */}
      <div className="glass-card mb-20">
        <div className="card-header">
          <div className="card-title"><FiTrendingUp /> Tren Keuntungan Bulanan (Rp)</div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={PROFIT_DATA}>
            <defs>
              <linearGradient id="labaGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} tickFormatter={v => `${v / 1000000}M`} />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={v => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Laba Bersih']}
            />
            <Area type="monotone" dataKey="Laba" stroke="#10B981" strokeWidth={2.5} fill="url(#labaGrad2)" dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#0a0f1e' }} activeDot={{ r: 8 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Line Chart Perbandingan */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">📈 Perbandingan Masuk vs Keluar (Trend)</div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Masuk" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 5 }} name="Masuk (Kg)" />
            <Line type="monotone" dataKey="Keluar" stroke="#10B981" strokeWidth={2.5} dot={{ r: 5 }} name="Keluar (Kg)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Statistik;
