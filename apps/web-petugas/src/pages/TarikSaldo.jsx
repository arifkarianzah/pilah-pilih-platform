import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Wallet, Smartphone, ShieldCheck, ChevronLeft, Building2, CreditCard } from "lucide-react";

function TarikSaldo() {
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const banks = [
    { id: "bca", name: "BCA", color: "#0066AE" },
    { id: "mandiri", name: "Mandiri", color: "#003D79" },
    { id: "bni", name: "BNI", color: "#F15A23" },
    { id: "bri", name: "BRI", color: "#00529C" },
    { id: "dana", name: "DANA", color: "#118EEA" },
    { id: "gopay", name: "GoPay", color: "#00AED6" }
  ];

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/wallet");
        setBalance(Number(res.data.balance) || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWallet();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (Number(amount) > balance) {
      setError("Saldo tidak mencukupi untuk penarikan ini.");
      return;
    }
    
    if (!selectedBank) {
      setError("Silakan pilih bank atau e-wallet tujuan.");
      return;
    }

    try {
      await api.post("/wallet/withdraw", {
        amount: Number(amount),
        bank_name: selectedBank,
        account_number: bankAccount,
        account_name: "Petugas Pilah Pilih"
      });

      setSuccess("Permintaan penarikan berhasil! Dana akan segera diproses.");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal melakukan penarikan.");
    }
  };

  return (
    <div style={{ padding: "2rem", width: "100%", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif", paddingBottom: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", cursor: "pointer" }} onClick={() => navigate(-1)}>
        <ChevronLeft size={24} />
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>Tarik Saldo</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        {/* Kolom Kiri: Informasi Saldo */}
        <div>
          <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)", borderRadius: "20px", padding: "2rem", color: "white", marginBottom: "2rem", boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", opacity: 0.9 }}>Saldo Dapat Ditarik</p>
            <h2 style={{ margin: 0, fontSize: "3rem", fontWeight: "800", letterSpacing: "-1px" }}>Rp {balance.toLocaleString("id-ID")}</h2>
          </div>
          
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>Syarat Penarikan</h3>
            <ul style={{ paddingLeft: "1.2rem", color: "#475569", fontSize: "0.9rem", lineHeight: "1.6" }}>
              <li>Minimal penarikan adalah Rp 10.000.</li>
              <li>Pastikan nomor rekening atau E-Wallet valid.</li>
              <li>Proses transfer memakan waktu maksimal 1x24 jam kerja.</li>
              <li>Tarik saldo tidak dikenakan biaya admin (gratis).</li>
            </ul>
          </div>
        </div>

        {/* Kolom Kanan: Form Tarik Saldo */}
        <div style={{ background: "white", padding: "2.5rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={24} color="#3b82f6" /> Formulir Penarikan
          </h3>
          
          <form onSubmit={handleWithdraw}>
            
            {/* Bank Selection */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#475569", fontWeight: "700", marginBottom: "0.75rem" }}>Bank / E-Wallet Tujuan</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.75rem" }}>
                {banks.map(bank => (
                  <div 
                    key={bank.id} 
                    onClick={() => setSelectedBank(bank.name)}
                    style={{ padding: "0.75rem", borderRadius: "12px", border: selectedBank === bank.name ? `2px solid ${bank.color}` : "1px solid #cbd5e1", background: selectedBank === bank.name ? `${bank.color}10` : "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                  >
                    <Building2 size={20} color={selectedBank === bank.name ? bank.color : "#94a3b8"} />
                    <span style={{ fontWeight: "700", fontSize: "0.85rem", color: selectedBank === bank.name ? bank.color : "#64748b" }}>{bank.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nomor Rekening */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#475569", fontWeight: "700", marginBottom: "0.75rem" }}>Nomor Rekening / HP</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "16px", color: "#94a3b8" }}><Smartphone size={20} /></span>
                <input 
                  type="text" 
                  style={{ width: "100%", padding: "1.2rem 1rem 1.2rem 3.5rem", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "1.1rem", outline: "none", transition: "all 0.2s" }} 
                  placeholder="Misal: 081234567890" 
                  value={bankAccount} 
                  onChange={(e) => setBankAccount(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Nominal Section */}
            <div style={{ marginBottom: "2.5rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#475569", fontWeight: "700", marginBottom: "0.75rem" }}>Nominal Penarikan</label>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                {[50000, 100000, balance].map((val, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    onClick={() => setAmount(val)}
                    style={{ padding: "0.75rem", borderRadius: "10px", border: amount == val ? "2px solid #3b82f6" : "1px solid #cbd5e1", background: amount == val ? "#eff6ff" : "white", color: amount == val ? "#3b82f6" : "#475569", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {idx === 2 ? "Tarik Semua" : `Rp ${(val/1000)}k`}
                  </button>
                ))}
              </div>

              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "16px", fontSize: "1.1rem", color: "#64748b", fontWeight: "700" }}>Rp</span>
                <input 
                  type="number" 
                  style={{ width: "100%", padding: "1.2rem 1rem 1.2rem 3.5rem", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "1.2rem", fontWeight: "700", outline: "none", transition: "all 0.2s" }} 
                  placeholder="0" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                  min="10000" 
                />
              </div>
            </div>

            {error && <div style={{ background: "#fef2f2", color: "#ef4444", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: "600" }}>{error}</div>}
            {success && <div style={{ background: "#f0fdf4", color: "#10b981", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: "600" }}>{success}</div>}

            <button type="submit" disabled={!amount || !bankAccount || !selectedBank || Number(amount) > balance} style={{ width: "100%", padding: "1.2rem", borderRadius: "12px", border: "none", background: "#3b82f6", color: "white", fontSize: "1.1rem", fontWeight: "800", cursor: "pointer", opacity: (!amount || !bankAccount || !selectedBank || Number(amount) > balance) ? 0.5 : 1, transition: "all 0.2s", boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)" }}>
              Tarik Saldo Sekarang
            </button>
            
            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#64748b", marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <ShieldCheck size={16} /> Diproses secara instan & aman
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TarikSaldo;
