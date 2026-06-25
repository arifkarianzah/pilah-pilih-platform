import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getAllPickups, weighPickup, completePickup } from "../services/pickupService";
import { Scale, Search, CheckCircle2, AlertTriangle, User, Package, Weight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Timbang() {
  const [pickups, setPickups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await getAllPickups();
      const eligibles = (res.data || []).filter(p =>
        ["accepted", "on_the_way"].includes(p.status)
      );
      setPickups(eligibles);
    } catch {
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActive(); }, []);

  const filtered = pickups.filter(p =>
    !search.trim() ||
    p.address?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.id).includes(search) ||
    p.waste_type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveWeight = async () => {
    if (!selected) return;
    const w = parseFloat(weight);
    if (!w || w <= 0) {
      showToast("Masukkan berat yang valid", "error");
      return;
    }
    setSaving(true);
    try {
      await weighPickup(selected.id, w);
      showToast(`Berat ${w} kg berhasil disimpan untuk order #${selected.id}`);
      setSelected({ ...selected, actual_weight: w });
      fetchActive();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menyimpan berat", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!selected) return;
    setCompleting(true);
    try {
      const res = await completePickup(selected.id);
      const earned = res.detail?.total_earned || 0;
      showToast(`Selesai! Saldo user bertambah Rp ${earned.toLocaleString("id-ID")}`);
      setSelected(null);
      setWeight("");
      fetchActive();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menyelesaikan", "error");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <>
      <Navbar
        title="Timbang Sampah"
        subtitle="Input berat aktual & selesaikan penjemputan"
        onRefresh={fetchActive}
        hideActions={true}
      />

      <div className="page-body">
        <div className="grid-2-asym">

          {/* Left: Pilih Order */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Pilih Order Aktif</div>
                <div className="card-subtitle">{pickups.length} order siap ditimbang</div>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <Search size={15} style={{
                position: "absolute", left: "0.85rem", top: "50%",
                transform: "translateY(-50%)", color: "var(--text-muted)"
              }} />
              <input
                type="text"
                className="form-input"
                placeholder="Cari order..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: "2.5rem", width: "100%" }}
              />
            </div>

            {loading ? (
              <div className="empty-state" style={{ minHeight: 200 }}>
                <div className="spinner" />
                <p>Memuat order aktif...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 200 }}>
                <div className="empty-state-icon"><Scale size={28} /></div>
                <h3>Tidak Ada Order Aktif</h3>
                <p>Order dengan status "Diterima" atau "Di Jalan" akan muncul di sini.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {filtered.map(order => (
                  <div
                    key={order.id}
                    onClick={() => { setSelected(order); setWeight(order.actual_weight || ""); }}
                    style={{
                      padding: "1rem",
                      borderRadius: "var(--radius-lg)",
                      border: selected?.id === order.id
                        ? "2px solid var(--primary)"
                        : "1.5px solid var(--border)",
                      background: selected?.id === order.id ? "var(--primary-light)" : "white",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>
                        #{order.id} — {order.waste_type || "Sampah"}
                      </span>
                      <span className={`badge badge-${order.status}`} style={{ fontSize: "0.7rem" }}>
                        {order.status === "accepted" ? "Diterima" : "Di Jalan"}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      👤 User #{order.user_id} &nbsp;·&nbsp; 📍 {order.address?.substring(0, 35)}...
                    </div>
                    <div style={{ fontSize: "0.78rem", marginTop: 4, color: order.actual_weight ? "var(--brand)" : "var(--text-light)", fontWeight: 600 }}>
                      {order.actual_weight ? `✓ Sudah ditimbang: ${order.actual_weight} kg` : "⚖️ Belum ditimbang"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Timbang Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {!selected ? (
              <div className="card" style={{ minHeight: 400 }}>
                <div className="empty-state" style={{ minHeight: 350 }}>
                  <div style={{
                    width: 80, height: 80, background: "var(--primary-light)",
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "var(--brand)", marginBottom: "1rem"
                  }}>
                    <Scale size={36} />
                  </div>
                  <h3>Pilih Order untuk Ditimbang</h3>
                  <p>Pilih salah satu order aktif dari daftar di sebelah kiri.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Order Summary */}
                <div className="card" style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-light))", color: "white" }}>
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", fontWeight: 600 }}>ORDER DIPILIH</p>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 900 }}>#{selected.id}</h2>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {[
                      { icon: User, label: "User ID", value: `#${selected.user_id}` },
                      { icon: Package, label: "Jenis Sampah", value: selected.waste_type || "-" },
                      { icon: Weight, label: "Estimasi Berat", value: `${selected.estimated_weight || "-"} kg` },
                      { icon: CheckCircle2, label: "Berat Aktual", value: selected.actual_weight ? `${selected.actual_weight} kg` : "Belum" },
                    ].map(item => (
                      <div key={item.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", padding: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", fontWeight: 600, marginBottom: 4 }}>
                          <item.icon size={12} /> {item.label}
                        </div>
                        <div style={{ fontWeight: 800, textTransform: "capitalize" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weight Input */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: "0.5rem" }}>Input Berat Aktual</div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                    Masukkan berat yang tertera di timbangan secara akurat.
                  </p>

                  <div className="form-group" style={{ marginBottom: "1rem" }}>
                    <label className="form-label">Berat Sampah (kg)</label>
                    <div className="weigh-input-wrapper">
                      <input
                        id="weight-input"
                        type="number"
                        className="form-input"
                        placeholder="0.0"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        min="0.1"
                        step="0.1"
                        style={{ fontSize: "1.5rem", fontWeight: 800, textAlign: "center" }}
                      />
                      <span className="unit">kg</span>
                    </div>
                    <p className="form-hint">Estimasi awal: {selected.estimated_weight || "-"} kg</p>
                  </div>

                  <button
                    id="btn-save-weight"
                    className="btn btn-primary btn-lg btn-full"
                    onClick={handleSaveWeight}
                    disabled={saving || !weight}
                  >
                    <Scale size={18} />
                    {saving ? "Menyimpan..." : "Simpan Berat"}
                  </button>
                </div>

                {/* Complete Button */}
                {selected.actual_weight && (
                  <div className="card" style={{ border: "2px solid var(--success)", background: "var(--success-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div style={{
                        width: 44, height: 44, background: "white", borderRadius: "var(--radius-lg)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)"
                      }}>
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--brand)" }}>Siap Diselesaikan</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--brand)", opacity: 0.8 }}>
                          Berat aktual: <strong>{selected.actual_weight} kg</strong>
                        </div>
                      </div>
                    </div>
                    <button
                      id="btn-complete-weigh"
                      className="btn btn-success btn-lg btn-full"
                      onClick={handleComplete}
                      disabled={completing}
                    >
                      <CheckCircle2 size={18} />
                      {completing ? "Menyelesaikan..." : "Selesaikan Penjemputan"}
                    </button>
                    <p style={{ fontSize: "0.78rem", color: "var(--brand)", opacity: 0.7, textAlign: "center", marginTop: "0.75rem" }}>
                      Saldo pengguna akan otomatis bertambah setelah diklik.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default Timbang;
