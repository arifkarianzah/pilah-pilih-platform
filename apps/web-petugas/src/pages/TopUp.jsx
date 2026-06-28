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
    <>
      {/* Gunakan Navbar global agar konsisten */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", flex: 1 }} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
          <h1 style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0, color: "var(--text)" }}>Top Up Saldo</h1>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2-res">
          
          {/* Kolom Kiri: Informasi Saldo & Bantuan */}
          <div style={{ minWidth: 0 }}>
            <div className="card" style={{ background: "linear-gradient(135deg, var(--brand) 0%, #10b981 100%)", borderRadius: "16px", padding: "1.5rem", color: "white", marginBottom: "1.5rem", border: "none", boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)" }}>
              <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", opacity: 0.9, fontWeight: 600 }}>Saldo Saat Ini</p>
              <h2 style={{ margin: 0, fontSize: "1.85rem", fontWeight: "800", letterSpacing: "-0.5px" }}>Rp {balance.toLocaleString("id-ID")}</h2>
            </div>
            
            <div className="card" style={{ padding: "1.25rem", borderRadius: "16px" }}>
              <h3 style={{ marginTop: 0, fontSize: "1rem", fontWeight: 800, marginBottom: "0.75rem" }}>Cara Top Up</h3>
              <ol style={{ paddingLeft: "1.2rem", color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: "1.5", margin: 0 }}>
                <li style={{ marginBottom: 4 }}>Pilih nominal uang yang ingin ditambahkan.</li>
                <li style={{ marginBottom: 4 }}>Pilih Bank atau E-Wallet tujuan transfer.</li>
                <li style={{ marginBottom: 4 }}>Klik "Top Up Sekarang".</li>
                <li>Saldo akan otomatis masuk ke akun Anda.</li>
              </ol>
            </div>
          </div>

          {/* Kolom Kanan: Form */}
          <div className="card" style={{ padding: "1.5rem", borderRadius: "16px", minWidth: 0 }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.25rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
              <ShoppingBag size={20} color="var(--brand)" /> Detail Top Up
            </h3>
            
            <form onSubmit={handleTopUp}>
              {/* Nominal Section */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text)", fontWeight: "700", marginBottom: "0.5rem" }}>Pilih Nominal</label>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 80px), 1fr))", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  {[50000, 100000, 250000, 500000].map(val => (
                    <button 
                      key={val} 
                      type="button" 
                      onClick={() => setAmount(val)}
                      style={{ padding: "0.6rem 0.25rem", borderRadius: "8px", border: amount == val ? "2px solid var(--brand)" : "1px solid var(--border)", background: amount == val ? "#f0fdf4" : "white", color: amount == val ? "var(--brand)" : "var(--text-muted)", fontWeight: "700", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      Rp {(val/1000)}k
                    </button>
                  ))}
                </div>

                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: "14px", fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: "700" }}>Rp</span>
                  <input 
                    type="number" 
                    className="form-input"
                    style={{ width: "100%", padding: "0.9rem 1rem 0.9rem 2.5rem", borderRadius: "10px", fontSize: "1rem", fontWeight: "700" }} 
                    placeholder="Atau ketik nominal..." 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                    min="10000" 
                  />
                </div>
              </div>

              {/* Bank Selection */}
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text)", fontWeight: "700", marginBottom: "0.5rem" }}>Metode Pembayaran</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 90px), 1fr))", gap: "0.5rem" }}>
                  {banks.map(bank => (
                    <div 
                      key={bank.id} 
                      onClick={() => setSelectedBank(bank.name)}
                      style={{ padding: "0.75rem 0.5rem", borderRadius: "10px", border: selectedBank === bank.name ? `2px solid ${bank.color}` : "1px solid var(--border)", background: selectedBank === bank.name ? `${bank.color}10` : "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", transition: "all 0.2s" }}
                    >
                      <Building2 size={18} color={selectedBank === bank.name ? bank.color : "var(--text-light)"} />
                      <span style={{ fontWeight: "700", fontSize: "0.75rem", color: selectedBank === bank.name ? bank.color : "var(--text-muted)" }}>{bank.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "0.8rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.8rem", fontWeight: "600", border: "1px solid #fecaca" }}>{error}</div>}
              {success && <div style={{ background: "var(--success-light)", color: "var(--brand)", padding: "0.8rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.8rem", fontWeight: "600", border: "1px solid #bbf7d0" }}>{success}</div>}

              <button type="submit" disabled={!amount || !selectedBank} className="btn btn-primary" style={{ width: "100%", padding: "1rem", borderRadius: "10px", background: "var(--brand)", fontSize: "0.95rem", opacity: (!amount || !selectedBank) ? 0.6 : 1, transition: "all 0.2s" }}>
                Top Up Sekarang
              </button>
              
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-light)", marginTop: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontWeight: 600 }}>
                <ShieldCheck size={14} /> Dijamin aman & terenkripsi
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default TopUp;
