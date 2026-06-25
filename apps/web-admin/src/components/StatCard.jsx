export default function StatCard({ icon, label, value, trend, trendUp, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg || '#f0fdf4', color: color || 'var(--brand)' }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      </div>
      <div className="stat-info">
        <div className="label">{label}</div>
        <div className={`value ${String(value).length > 8 ? 'small' : ''}`}>{value}</div>
        {trend && (
          <div className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            <span>{trendUp ? '↑' : '↓'}</span>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
