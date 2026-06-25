import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Wallet, Smartphone, ShieldCheck, ChevronLeft, ShoppingBag, Building2 } from "lucide-react";

function TopUp() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [selectedBank, setSelectedBank] = useState("");
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

  const handleTopUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (Number(amount) < 10000) {
      setError("Minimal top up Rp 10.000");
      return;
    }
    
    if (!selectedBank) {
      setError("Silakan pilih metode pembayaran (Bank/E-Wallet).");
      return;
    }

    try {
      await api.post("/wallet/topup", {
        amount: Number(amount),
        method: selectedBank
      });

      setSuccess(`Top up berhasil melalui ${selectedBank}! Saldo Anda telah bertambah.`);
      setBalance(b => b + Number(amount));
      setAmount("");
      setSelectedBank("");
      
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal melakukan top up.");
    }
  };

  return (
    <div style={{ padding: "2rem", width: "100%", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif", paddingBottom: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", cursor: "pointer" }} onClick={() => navigate(-1)}>
        <ChevronLeft size={24} />
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>Top Up Saldo</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        {/* Kolom Kiri: Informasi Saldo & Bantuan */}
        <div>
          <div style={{ background: "linear-gradient(135deg, var(--brand) 0%, #10b981 100%)", borderRadius: "20px", padding: "2rem", color: "white", marginBottom: "2rem", boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)" }}>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", opacity: 0.9 }}>Saldo Saat Ini</p>
            <h2 style={{ margin: 0, fontSize: "3rem", fontWeight: "800", letterSpacing: "-1px" }}>Rp {balance.toLocaleString("id-ID")}</h2>
          </div>
          
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>Cara Top Up</h3>
            <ol style={{ paddingLeft: "1.2rem", color: "#475569", fontSize: "0.9rem", lineHeight: "1.6" }}>
              <li>Pilih nominal uang yang ingin ditambahkan.</li>
              <li>Pilih Bank atau E-Wallet tujuan transfer.</li>
              <li>Klik "Top Up Sekarang".</li>
              <li>Saldo akan otomatis masuk ke akun Anda.</li>
            </ol>
          </div>
        </div>

        {/* Kolom Kanan: Form */}
        <div style={{ background: "white", padding: "2.5rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={24} color="var(--brand)" /> Detail Top Up
          </h3>
          
          <form onSubmit={handleTopUp}>
            {/* Nominal Section */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#475569", fontWeight: "700", marginBottom: "0.75rem" }}>Pilih Nominal</label>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                {[50000, 100000, 250000, 500000].map(val => (
                  <button 
                    key={val} 
                    type="button" 
                    onClick={() => setAmount(val)}
                    style={{ padding: "0.75rem", borderRadius: "10px", border: amount == val ? "2px solid var(--brand)" : "1px solid #cbd5e1", background: amount == val ? "#f0fdf4" : "white", color: amount == val ? "var(--brand)" : "#475569", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    Rp {(val/1000)}k
                  </button>
                ))}
              </div>

              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "16px", fontSize: "1.1rem", color: "#64748b", fontWeight: "700" }}>Rp</span>
                <input 
                  type="number" 
                  style={{ width: "100%", padding: "1.2rem 1rem 1.2rem 3.5rem", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "1.2rem", fontWeight: "700", outline: "none", transition: "all 0.2s" }} 
                  placeholder="Atau ketik nominal..." 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                  min="10000" 
                />
              </div>
            </div>

            {/* Bank Selection */}
            <div style={{ marginBottom: "2.5rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#475569", fontWeight: "700", marginBottom: "0.75rem" }}>Metode Pembayaran</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem" }}>
                {banks.map(bank => (
                  <div 
                    key={bank.id} 
                    onClick={() => setSelectedBank(bank.name)}
                    style={{ padding: "1rem", borderRadius: "12px", border: selectedBank === bank.name ? `2px solid ${bank.color}` : "1px solid #cbd5e1", background: selectedBank === bank.name ? `${bank.color}10` : "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                  >
                    <Building2 size={24} color={selectedBank === bank.name ? bank.color : "#94a3b8"} />
                    <span style={{ fontWeight: "700", color: selectedBank === bank.name ? bank.color : "#64748b" }}>{bank.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={{ background: "#fef2f2", color: "#ef4444", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: "600" }}>{error}</div>}
            {success && <div style={{ background: "#f0fdf4", color: "#10b981", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: "600" }}>{success}</div>}

            <button type="submit" disabled={!amount || !selectedBank} style={{ width: "100%", padding: "1.2rem", borderRadius: "12px", border: "none", background: "var(--brand)", color: "white", fontSize: "1.1rem", fontWeight: "800", cursor: "pointer", opacity: (!amount || !selectedBank) ? 0.5 : 1, transition: "all 0.2s", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)" }}>
              Top Up Sekarang
            </button>
            
            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#64748b", marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <ShieldCheck size={16} /> Dijamin aman & terenkripsi
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TopUp;
