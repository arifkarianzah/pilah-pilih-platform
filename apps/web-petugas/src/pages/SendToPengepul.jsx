import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPickupById, updatePickupStatus, uploadPickupPhoto } from "../services/pickupService";
import api from "../services/api";
import { Truck, CheckCircle2, AlertTriangle, ArrowLeft, Image as ImageIcon, Camera } from "lucide-react";

function SendToPengepul() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [pengepuls, setPengepuls] = useState([]);
  const [selectedPengepul, setSelectedPengepul] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const orderRes = await getPickupById(id);
        setOrder(orderRes.data);

        // Fetch contacts and filter pengepul
        const contactsRes = await api.get("/pickups/contacts");
        const pengepulList = contactsRes.data.data.filter(c => c.role === "pengepul");
        setPengepuls(pengepulList);
      } catch (err) {
        showToast("Gagal memuat data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPengepul) {
      showToast("Pilih Pengepul terlebih dahulu", "error");
      return;
    }

    setActionLoading(true);
    try {
      // 1. Upload photo if exists
      if (photo) {
        await uploadPickupPhoto(id, photo, 'pickup_proof');
      }

      // 2. Update status
      await updatePickupStatus(id, "waiting_collector", { pengepul_id: selectedPengepul });
      
      showToast("Berhasil dikirim ke Pengepul!");
      setTimeout(() => navigate(`/orders/${id}`), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Terjadi kesalahan", "error");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="Kirim ke Pengepul" hideActions={true} />
        <div className="page-body">
          <div className="empty-state" style={{ minHeight: 400 }}>
            <div className="spinner" />
            <p>Memuat data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Kirim ke Pengepul" hideActions={true} />
      <div className="page-body">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: "1.5rem" }}
        >
          <ArrowLeft size={14} /> Kembali
        </button>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: 4 }}>Order #{id}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Sampah {order?.waste_type}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">Pilih Pengepul Tujuan</label>
              <select
                className="form-input"
                value={selectedPengepul}
                onChange={(e) => setSelectedPengepul(e.target.value)}
                required
              >
                <option value="">-- Pilih Pengepul --</option>
                {pengepuls.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.address || 'Pengepul Terdekat'})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Foto Bukti Sampah (Opsional)</label>
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--surface-2)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('photo-upload').click()}
              >
                {photo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={32} color="var(--success)" />
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{photo.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Klik untuk ganti foto</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={32} color="var(--text-muted)" />
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>Pilih Foto Bukti</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maks 5MB (JPG/PNG)</span>
                  </div>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={actionLoading || !selectedPengepul}
              style={{ marginTop: "1rem" }}
            >
              <Truck size={18} />
              {actionLoading ? "Memproses..." : "Kirim Sekarang"}
            </button>
          </form>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default SendToPengepul;
