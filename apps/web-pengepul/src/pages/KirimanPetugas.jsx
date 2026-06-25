import { useState, useEffect } from 'react';
import { FiTruck, FiStar, FiPackage, FiAward } from 'react-icons/fi';
import { getPetugasPerformance } from '../api/pengepulAPI';
import PageHeader from '../components/UI/PageHeader';

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#F59E0B', '#94A3B8', '#CD7C2F'];

const KirimanPetugas = () => {
  const [petugas, setPetugas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPetugasPerformance();
        setPetugas(res.data);
      } catch {
        setPetugas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maxBerat = Math.max(...petugas.map(p => parseFloat(p.total_berat || 0)), 1);
  const totalBerat = petugas.reduce((acc, p) => acc + parseFloat(p.total_berat || 0), 0);
  const totalKiriman = petugas.reduce((acc, p) => acc + parseInt(p.total_kiriman || 0), 0);

  if (loading) {
    return <div className="loading-wrap"><div className="spinner"></div><span>Memuat data petugas...</span></div>;
  }

  return (
    <div>
      <PageHeader
        title="Kiriman Petugas"
        subtitle="Performa dan ranking petugas lapangan"
      />

      {/* Summary */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
        <div className="glass-card stat-card" style={{ '--card-accent': '#3B82F6', '--card-icon-bg': 'rgba(59,130,246,0.12)' }}>
          <div className="stat-card-icon"><FiTruck /></div>
          <h3>Total Petugas</h3>
          <div className="value">{petugas.length}</div>
          <div className="value-sub">Petugas aktif</div>
        </div>
        <div className="glass-card stat-card" style={{ '--card-accent': '#10B981', '--card-icon-bg': 'rgba(16,185,129,0.12)' }}>
          <div className="stat-card-icon"><FiPackage /></div>
          <h3>Total Kiriman</h3>
          <div className="value">{totalKiriman}</div>
          <div className="value-sub">Semua petugas</div>
        </div>
        <div className="glass-card stat-card" style={{ '--card-accent': '#8B5CF6', '--card-icon-bg': 'rgba(139,92,246,0.12)' }}>
          <div className="stat-card-icon">⚖️</div>
          <h3>Total Berat</h3>
          <div className="value">{totalBerat.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</div>
          <div className="value-sub">Kilogram terkumpul</div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {petugas.length >= 1 && (
        <div className="glass-card mb-24">
          <div className="card-header">
            <div className="card-title"><FiAward /> Top Performer Bulan Ini</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {petugas.slice(0, 3).map((p, i) => (
              <div key={p.id} style={{
                borderRadius: 14, padding: '24px 20px', textAlign: 'center',
                background: `linear-gradient(135deg, ${MEDAL_COLORS[i]}18, ${MEDAL_COLORS[i]}08)`,
                border: `1px solid ${MEDAL_COLORS[i]}35`,
                transition: 'transform 0.2s',
              }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{MEDALS[i]}</div>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                  background: `linear-gradient(135deg, ${MEDAL_COLORS[i]}, ${MEDAL_COLORS[i]}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: '#fff',
                }}>
                  {p.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>Peringkat #{i + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 6px' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: MEDAL_COLORS[i] }}>{p.total_kiriman}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Kiriman</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 6px' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: MEDAL_COLORS[i] }}>{(parseFloat(p.total_berat || 0)).toFixed(0)}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Kg</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title"><FiStar /> Ranking Semua Petugas</div>
        </div>

        {/* Performance Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {petugas.map((p, i) => {
            const berat = parseFloat(p.total_berat || 0);
            const pct = (berat / maxBerat) * 100;
            return (
              <div key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{MEDALS[i] || `#${i + 1}`}</span>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </div>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{berat.toFixed(1)} Kg</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Nama Petugas</th>
                <th>Total Kiriman</th>
                <th>Total Berat</th>
                <th>Rata-rata / Kiriman</th>
                <th>Kontribusi</th>
              </tr>
            </thead>
            <tbody>
              {petugas.map((p, i) => {
                const berat = parseFloat(p.total_berat || 0);
                const avg = p.total_kiriman > 0 ? (berat / p.total_kiriman).toFixed(1) : 0;
                const contrib = totalBerat > 0 ? ((berat / totalBerat) * 100).toFixed(1) : 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: i < 3 ? MEDAL_COLORS[i] : 'var(--text-muted)' }}>
                        {MEDALS[i] || `#${i + 1}`}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.total_kiriman} kali</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{berat.toFixed(1)} Kg</td>
                    <td>{avg} Kg/kiriman</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-bar-wrap" style={{ width: 80 }}>
                          <div className="progress-bar-fill" style={{ width: `${contrib}%` }}></div>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{contrib}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {petugas.length === 0 && (
                <tr><td colSpan="6"><div className="empty-state">
                  <div className="empty-state-icon">👷</div>
                  <h3>Belum Ada Data Petugas</h3>
                </div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KirimanPetugas;
