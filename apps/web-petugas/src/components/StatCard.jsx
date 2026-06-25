function StatCard({ icon, label, value, color, bg, trend, trendLabel, smallValue }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color: color }}>
        {icon}
      </div>
      <div className="stat-info">
        <p>{label}</p>
        <h3 style={{ color: color }} className={smallValue ? "small-value" : ""}>{value}</h3>
        {trend !== undefined && (
          <div className="stat-trend" style={{ color: trend >= 0 ? "var(--success)" : "var(--danger)" }}>
            {trend >= 0 ? "▲" : "▼"} {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
