import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, Camera, Image as ImageIcon, ScanLine, CheckCircle2, RotateCcw } from "lucide-react";

function AiScan() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Simulasi proses scanning
  const handleScan = () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulasi waktu loading AI
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        type: "Botol Plastik (PET)",
        confidence: 98,
        price: "Rp 2.500 / kg",
        points: "25 poin",
        recommendation: "Kosongkan isi dan remas botol untuk menghemat ruang sebelum disetorkan.",
        color: "#10b981", // Emerald green
      });
    }, 3000);
  };

  const resetScan = () => {
    setScanResult(null);
  };

  return (
    <div className="app-container" style={{ background: "#0f172a", minHeight: "100vh", paddingBottom: "100px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: "#1e293b", padding: "1.5rem 5% 1rem 5%", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #334155" }}>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={20} color="white" />
          </div>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem" }}>
          <ScanLine size={20} color="#10b981" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "white", margin: 0 }}>AI Scan Sampah</h2>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        
        {/* Intro Text */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
            Arahkan kamera ke sampah Anda. Teknologi AI kami akan secara otomatis mendeteksi jenis material, estimasi harga, dan memberikan panduan daur ulang.
          </p>
        </div>

        {/* === 2 COLUMNS LAYOUT === */}
        <div className="ai-scan-grid">
          
          {/* COLUMN 1: SCANNER VIEWFINDER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Viewfinder Frame */}
            <div style={{ background: "#000", borderRadius: "24px", position: "relative", overflow: "hidden", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", border: "2px solid #1e293b" }}>
              
              {/* Dummy Camera Output Background */}
              <div style={{ position: "absolute", inset: 0, opacity: scanResult ? 0.4 : 0.8, background: "radial-gradient(circle, #1e293b 0%, #000 100%)", transition: "all 0.5s" }}></div>

              {/* Grid Lines Pattern */}
              <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

              {/* Corner Brackets */}
              <div style={{ position: "absolute", top: "20px", left: "20px", width: "40px", height: "40px", borderTop: "4px solid #10b981", borderLeft: "4px solid #10b981", borderRadius: "8px 0 0 0" }}></div>
              <div style={{ position: "absolute", top: "20px", right: "20px", width: "40px", height: "40px", borderTop: "4px solid #10b981", borderRight: "4px solid #10b981", borderRadius: "0 8px 0 0" }}></div>
              <div style={{ position: "absolute", bottom: "20px", left: "20px", width: "40px", height: "40px", borderBottom: "4px solid #10b981", borderLeft: "4px solid #10b981", borderRadius: "0 0 0 8px" }}></div>
              <div style={{ position: "absolute", bottom: "20px", right: "20px", width: "40px", height: "40px", borderBottom: "4px solid #10b981", borderRight: "4px solid #10b981", borderRadius: "0 0 8px 0" }}></div>

              {/* Animated Laser Line */}
              {isScanning && (
                <div className="laser-beam" style={{ position: "absolute", left: "10%", right: "10%", height: "2px", background: "#10b981", boxShadow: "0 0 20px 5px rgba(16, 185, 129, 0.5)" }}></div>
              )}

              {/* Central Status UI */}
              <div style={{ position: "relative", zIndex: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                {!isScanning && !scanResult && (
                  <>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(30, 41, 59, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #475569", backdropFilter: "blur(4px)" }}>
                      <Camera size={30} color="#94a3b8" />
                    </div>
                    <span style={{ color: "#cbd5e1", fontSize: "0.9rem", fontWeight: "600", background: "rgba(0,0,0,0.5)", padding: "0.4rem 1rem", borderRadius: "20px" }}>Siap Memindai</span>
                  </>
                )}
                
                {isScanning && (
                  <span style={{ color: "#10b981", fontSize: "1rem", fontWeight: "800", background: "rgba(0,0,0,0.6)", padding: "0.5rem 1.5rem", borderRadius: "20px", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #10b981" }}>
                    <ScanLine className="spin-slow" size={18} /> Memproses AI...
                  </span>
                )}

                {scanResult && (
                  <div style={{ animation: "popIn 0.5s ease-out" }}>
                    <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: scanResult.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", boxShadow: `0 0 30px ${scanResult.color}80` }}>
                      <CheckCircle2 size={40} color="white" />
                    </div>
                    <span style={{ color: "white", fontSize: "1.2rem", fontWeight: "800", background: "rgba(0,0,0,0.6)", padding: "0.5rem 1.5rem", borderRadius: "20px" }}>Deteksi Berhasil!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem" }}>
              {!isScanning && !scanResult ? (
                <>
                  <button onClick={handleScan} style={{ flex: 1, background: "#10b981", color: "white", border: "none", padding: "1rem", borderRadius: "16px", fontSize: "1rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)" }}>
                    <ScanLine size={20} /> Mulai Scan
                  </button>
                  <button style={{ background: "#1e293b", color: "white", border: "1px solid #334155", padding: "1rem", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <ImageIcon size={24} color="#94a3b8" />
                  </button>
                </>
              ) : scanResult ? (
                <button onClick={resetScan} style={{ flex: 1, background: "#1e293b", color: "white", border: "1px solid #334155", padding: "1rem", borderRadius: "16px", fontSize: "1rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <RotateCcw size={20} /> Pindai Ulang
                </button>
              ) : null}
            </div>

          </div>

          {/* COLUMN 2: RESULT PANEL */}
          <div style={{ background: "#1e293b", borderRadius: "24px", padding: "2rem", border: "1px solid #334155", display: "flex", flexDirection: "column" }}>
            
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "white", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ScanLine size={20} color="#10b981" /> Hasil Deteksi AI
            </h3>

            {!scanResult && !isScanning ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #334155", borderRadius: "16px", padding: "3rem 1rem", textAlign: "center" }}>
                <Camera size={40} color="#475569" style={{ marginBottom: "1rem" }} />
                <p style={{ color: "#94a3b8", margin: 0, fontWeight: "500" }}>Belum ada objek yang dipindai.</p>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.5rem" }}>Silakan mulai scan untuk melihat hasil analisis di sini.</p>
              </div>
            ) : isScanning ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div className="loader-pulse"></div>
                <p style={{ color: "#10b981", fontWeight: "700", marginTop: "1.5rem" }}>Sedang menganalisis...</p>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Mencocokkan pola dengan jutaan data sampah</p>
              </div>
            ) : (
              <div style={{ animation: "fadeInUp 0.5s ease-out", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* Result Title */}
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "1px" }}>Terdeteksi Sebagai:</p>
                  <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "white", margin: 0 }}>{scanResult.type}</h2>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#cbd5e1", fontSize: "0.85rem", fontWeight: "600" }}>Tingkat Akurasi AI</span>
                    <span style={{ color: scanResult.color, fontSize: "0.85rem", fontWeight: "800" }}>{scanResult.confidence}%</span>
                  </div>
                  <div style={{ height: "8px", background: "#334155", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${scanResult.confidence}%`, height: "100%", background: scanResult.color, borderRadius: "4px" }}></div>
                  </div>
                </div>

                {/* Info Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: "#0f172a", padding: "1rem", borderRadius: "16px", border: "1px solid #334155" }}>
                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: "600", margin: "0 0 0.3rem 0" }}>Estimasi Harga</p>
                    <span style={{ color: "white", fontSize: "1.1rem", fontWeight: "800" }}>{scanResult.price}</span>
                  </div>
                  <div style={{ background: "#0f172a", padding: "1rem", borderRadius: "16px", border: "1px solid #334155" }}>
                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: "600", margin: "0 0 0.3rem 0" }}>Potensi Poin</p>
                    <span style={{ color: "#eab308", fontSize: "1.1rem", fontWeight: "800" }}>+{scanResult.points}</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div style={{ background: "rgba(16, 185, 129, 0.1)", borderLeft: "4px solid #10b981", padding: "1rem 1.2rem", borderRadius: "0 12px 12px 0" }}>
                  <h4 style={{ color: "#10b981", margin: "0 0 0.3rem 0", fontSize: "0.9rem", fontWeight: "800" }}>💡 Rekomendasi Pintar</h4>
                  <p style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.5", margin: 0 }}>{scanResult.recommendation}</p>
                </div>

                {/* Action Button */}
                <button onClick={() => navigate("/jual-sampah")} style={{ background: "white", color: "#0f172a", border: "none", padding: "1.2rem", borderRadius: "16px", fontSize: "1rem", fontWeight: "800", marginTop: "1rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(255,255,255,0.1)" }}>
                  Jual Sampah Ini Sekarang
                </button>

              </div>
            )}

          </div>

        </div>
      </div>

      <style>{`
        .ai-scan-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
        }

        .laser-beam {
          animation: scanVertical 2s ease-in-out infinite alternate;
        }

        .loader-pulse {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 1.5s infinite;
        }

        @keyframes scanVertical {
          0% { top: 10%; }
          100% { top: 90%; }
        }

        @keyframes pulse {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .ai-scan-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <BottomNav />
    </div>
  );
}

export default AiScan;
