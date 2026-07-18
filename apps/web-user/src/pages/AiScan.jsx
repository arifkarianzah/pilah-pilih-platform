import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, Camera, Image as ImageIcon, ScanLine, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

function AiScan() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
  // Camera State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [apiError, setApiError] = useState("");
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      let mediaStream;
      try {
        // Coba akses kamera belakang (HP)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
      } catch (err) {
        // Kalau gagal (misal di laptop), pakai kamera default
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imgData);
      return imgData;
    }
    return null;
  };

  const processWithGemini = async (base64Image) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      setApiKeyMissing(true);
      throw new Error("API Key belum diset");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `Anda adalah asisten AI pendeteksi sampah daur ulang. 
Tolong identifikasi objek utama di gambar ini. 
Jika objek BUKAN sampah atau barang bekas yang bisa didaur ulang (misal: manusia, hewan, pohon, elektronik aktif, makanan, dll), set "is_waste" ke false.
Jika objek ADALAH sampah yang bisa didaur ulang, set "is_waste" ke true.
Kembalikan respon DALAM FORMAT JSON SAJA (tanpa markdown, backtick, atau teks lain) dengan struktur persis seperti ini:
{
  "is_waste": boolean,
  "type": "Nama Material (misal: Besi, Kardus, Botol Plastik PET) atau 'Bukan Sampah'",
  "confidence": angka_integer_1_sampai_100,
  "price": "estimasi harga (misal: Rp 2.500 / kg) atau '-'",
  "points": "estimasi poin (misal: 25 poin) atau '-'",
  "recommendation": "Saran singkat cara mendaur ulangnya, atau alasan penolakan jika bukan sampah",
  "color": "Kode warna hex (misal #10b981 untuk plastik, #f59e0b untuk kardus, #ef4444 jika bukan sampah)"
}`;

    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const image = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    const text = response.text();
    
    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Gagal parse respons AI:", text);
      throw new Error("Format balasan AI tidak sesuai");
    }
  };

  const handleScan = async () => {
    setApiError("");
    let imgData = capturedImage;
    
    // Capture image if not already captured
    if (!imgData && hasCamera) {
      imgData = captureImage();
    }
    
    if (!imgData && hasCamera) {
      setApiError("Gagal mengambil gambar dari kamera.");
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // Tunggu respons dari Gemini
      const result = await processWithGemini(imgData || "mock");
      setScanResult(result);
      if(hasCamera) stopCamera();
    } catch (err) {
      console.error(err);
      
      // Fallback simulation jika API key tidak ada atau kena Limit/Error 429
      setTimeout(() => {
        // Logika acak sederhana: Detik genap = Sampah (Kardus), Detik ganjil = Bukan Sampah
        const isWaste = new Date().getSeconds() % 2 === 0;
        
        if (isWaste) {
          setScanResult({
            is_waste: true,
            type: "Kardus Bekas (Simulasi)",
            confidence: 92,
            price: "Rp 1.500 / kg",
            points: "15 poin",
            recommendation: "Ini adalah Mode Simulasi karena kuota API habis. Pastikan kardus kering dan dilipat pipih sebelum disetor.",
            color: "#f59e0b",
          });
        } else {
          setScanResult({
            is_waste: false,
            type: "Bukan Sampah (Simulasi)",
            confidence: 99,
            price: "-",
            points: "-",
            recommendation: "Ini adalah Mode Simulasi karena kuota API habis. Objek ini terdeteksi sebagai manusia/benda lain yang tidak bisa didaur ulang.",
            color: "#ef4444",
          });
        }
        
        if(hasCamera) stopCamera();
        setIsScanning(false);
      }, 2000);
      
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setCapturedImage(null);
    setApiError("");
    setApiKeyMissing(false);
    startCamera();
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
            Arahkan kamera ke sampah Anda. Teknologi AI Generative kami akan secara otomatis mendeteksi jenis material, estimasi harga, dan memberikan panduan daur ulang.
          </p>
          {apiKeyMissing && (
            <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid #f59e0b", color: "#f59e0b", padding: "0.75rem", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", fontSize: "0.85rem" }}>
              <AlertTriangle size={16} /> API Key Gemini belum ditambahkan. Menggunakan mode simulasi.
            </div>
          )}
        </div>

        {/* === 2 COLUMNS LAYOUT === */}
        <div className="ai-scan-grid">
          
          {/* COLUMN 1: SCANNER VIEWFINDER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Viewfinder Frame */}
            <div style={{ background: "#000", borderRadius: "24px", position: "relative", overflow: "hidden", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", border: "2px solid #1e293b" }}>
              
              {/* Real Camera Stream */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: "100%", height: "100%", objectFit: "cover", display: capturedImage ? "none" : (hasCamera ? "block" : "none") }} 
              />
              
              {/* Captured Image Preview */}
              {capturedImage && (
                <img src={capturedImage} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              
              {/* Hidden canvas for taking snapshot */}
              <canvas ref={canvasRef} style={{ display: "none" }} />
              
              {/* Fallback pattern if no camera */}
              {!hasCamera && !capturedImage && (
                <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
              )}

              {/* Overlay Darkener */}
              <div style={{ position: "absolute", inset: 0, opacity: scanResult ? 0.4 : (hasCamera && !capturedImage ? 0 : 0.8), background: "radial-gradient(circle, #1e293b 0%, #000 100%)", transition: "all 0.5s", pointerEvents: "none" }}></div>

              {/* Corner Brackets */}
              <div style={{ position: "absolute", top: "20px", left: "20px", width: "40px", height: "40px", borderTop: "4px solid #10b981", borderLeft: "4px solid #10b981", borderRadius: "8px 0 0 0", pointerEvents: "none" }}></div>
              <div style={{ position: "absolute", top: "20px", right: "20px", width: "40px", height: "40px", borderTop: "4px solid #10b981", borderRight: "4px solid #10b981", borderRadius: "0 8px 0 0", pointerEvents: "none" }}></div>
              <div style={{ position: "absolute", bottom: "20px", left: "20px", width: "40px", height: "40px", borderBottom: "4px solid #10b981", borderLeft: "4px solid #10b981", borderRadius: "0 0 0 8px", pointerEvents: "none" }}></div>
              <div style={{ position: "absolute", bottom: "20px", right: "20px", width: "40px", height: "40px", borderBottom: "4px solid #10b981", borderRight: "4px solid #10b981", borderRadius: "0 0 8px 0", pointerEvents: "none" }}></div>

              {/* Animated Laser Line */}
              {isScanning && (
                <div className="laser-beam" style={{ position: "absolute", left: "10%", right: "10%", height: "2px", background: "#10b981", boxShadow: "0 0 20px 5px rgba(16, 185, 129, 0.5)" }}></div>
              )}

              {/* Central Status UI */}
              <div style={{ position: "absolute", zIndex: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", pointerEvents: "none" }}>
                {!isScanning && !scanResult && !hasCamera && (
                  <>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(30, 41, 59, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #475569", backdropFilter: "blur(4px)" }}>
                      <Camera size={30} color="#94a3b8" />
                    </div>
                    <span style={{ color: "#cbd5e1", fontSize: "0.9rem", fontWeight: "600", background: "rgba(0,0,0,0.5)", padding: "0.4rem 1rem", borderRadius: "20px" }}>Kamera Tidak Tersedia</span>
                  </>
                )}
                
                {isScanning && (
                  <span style={{ color: "#10b981", fontSize: "1rem", fontWeight: "800", background: "rgba(0,0,0,0.7)", padding: "0.5rem 1.5rem", borderRadius: "20px", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #10b981", backdropFilter: "blur(4px)" }}>
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

            {/* Error Message */}
            {apiError && (
              <div style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "12px", border: "1px solid #ef4444", fontSize: "0.85rem" }}>
                {apiError}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem" }}>
              {!isScanning && !scanResult ? (
                <>
                  <button onClick={handleScan} disabled={!hasCamera && !capturedImage} style={{ flex: 1, background: (!hasCamera && !capturedImage) ? "#334155" : "#10b981", color: "white", border: "none", padding: "1rem", borderRadius: "16px", fontSize: "1rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: (!hasCamera && !capturedImage) ? "not-allowed" : "pointer", boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)" }}>
                    <ScanLine size={20} /> Ambil Foto & Analisis
                  </button>
                  <label style={{ background: "#1e293b", color: "white", border: "1px solid #334155", padding: "1rem", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setCapturedImage(ev.target.result);
                          stopCamera();
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }} />
                    <ImageIcon size={24} color="#94a3b8" />
                  </label>
                </>
              ) : scanResult ? (
                <button onClick={resetScan} style={{ flex: 1, background: "#1e293b", color: "white", border: "1px solid #334155", padding: "1rem", borderRadius: "16px", fontSize: "1rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <RotateCcw size={20} /> Pindai Objek Lain
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
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.5rem" }}>Silakan ambil foto untuk melihat hasil analisis AI Gemini di sini.</p>
              </div>
            ) : isScanning ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div className="loader-pulse"></div>
                <p style={{ color: "#10b981", fontWeight: "700", marginTop: "1.5rem" }}>AI sedang menganalisis...</p>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Mencocokkan pola gambar dengan data daur ulang</p>
              </div>
            ) : (
              <div style={{ animation: "fadeInUp 0.5s ease-out", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* Result Title & Price */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: scanResult.is_waste === false ? "#ef4444" : "#94a3b8", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {scanResult.is_waste === false ? "Objek Ditolak" : "Terdeteksi Sebagai:"}
                  </p>
                  <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: scanResult.is_waste === false ? "#ef4444" : "white", margin: 0 }}>
                    {scanResult.type}
                  </h2>
                  {scanResult.is_waste !== false && scanResult.price && scanResult.price !== "-" && (
                    <div style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.2)", padding: "0.4rem 1.2rem", borderRadius: "20px", marginTop: "0.75rem", border: "1px solid #10b981" }}>
                      <span style={{ color: "#10b981", fontSize: "1.2rem", fontWeight: "800" }}>{scanResult.price}</span>
                    </div>
                  )}
                </div>

                {/* Confidence Bar */}
                {scanResult.is_waste !== false && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ color: "#cbd5e1", fontSize: "0.85rem", fontWeight: "600" }}>Tingkat Keyakinan AI</span>
                      <span style={{ color: scanResult.color, fontSize: "0.85rem", fontWeight: "800" }}>{scanResult.confidence}%</span>
                    </div>
                    <div style={{ height: "8px", background: "#334155", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${scanResult.confidence}%`, height: "100%", background: scanResult.color, borderRadius: "4px", transition: "width 1s ease-out" }}></div>
                    </div>
                  </div>
                )}

                {/* Info Cards (Only if it is waste) */}
                {scanResult.is_waste !== false && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                    <div style={{ background: "#0f172a", padding: "1rem", borderRadius: "16px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", margin: 0 }}>Potensi Poin</p>
                      <span style={{ color: "#eab308", fontSize: "1.1rem", fontWeight: "800" }}>+{scanResult.points}</span>
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div style={{ background: scanResult.is_waste === false ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", borderLeft: `4px solid ${scanResult.is_waste === false ? "#ef4444" : "#10b981"}`, padding: "1rem 1.2rem", borderRadius: "0 12px 12px 0" }}>
                  <h4 style={{ color: scanResult.is_waste === false ? "#ef4444" : "#10b981", margin: "0 0 0.3rem 0", fontSize: "0.9rem", fontWeight: "800" }}>
                    {scanResult.is_waste === false ? "❌ Alasan Penolakan" : "💡 Panduan Daur Ulang"}
                  </h4>
                  <p style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.5", margin: 0 }}>{scanResult.recommendation}</p>
                </div>

                {/* Action Button */}
                {scanResult.is_waste !== false && (
                  <button onClick={() => navigate("/jual-sampah")} style={{ background: "white", color: "#0f172a", border: "none", padding: "1.2rem", borderRadius: "16px", fontSize: "1rem", fontWeight: "800", marginTop: "1rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(255,255,255,0.1)" }}>
                    Jual Sampah Ini Sekarang
                  </button>
                )}

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
