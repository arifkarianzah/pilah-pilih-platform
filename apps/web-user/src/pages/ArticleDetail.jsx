import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Clock, Heart, Share2 } from "lucide-react";

function ArticleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Dummy article data
  const article = {
    title: id === "1" ? "5 Cara Mudah Pilah Sampah di Rumah" : "Plastik PET: Dari Sampah Jadi Bernilai",
    author: "Admin",
    readTime: "5 mnt baca",
    date: "12 Okt 2023",
    likes: 248,
    category: id === "1" ? "Tips & Trik" : "Daur Ulang",
    content: `
      <p>Memilah sampah tidak perlu sulit. Dengan 5 langkah sederhana ini, Anda bisa memulai kebiasaan baik dari rumah sendiri.</p>
      <br/>
      <h4>1. Sediakan Tempat Sampah Terpisah</h4>
      <p>Langkah pertama yang paling krusial adalah memiliki minimal dua tempat sampah: satu untuk organik (sisa makanan) dan satu untuk anorganik (plastik, kertas, botol).</p>
      <br/>
      <h4>2. Bersihkan Sampah Anorganik</h4>
      <p>Sebelum membuang botol atau kemasan plastik, bilas sedikit dengan air agar tidak mengundang semut dan bau. Ini juga membuat nilai jualnya lebih tinggi saat disetorkan.</p>
      <br/>
      <h4>3. Kumpulkan Minyak Jelantah</h4>
      <p>Jangan buang minyak bekas menggoreng ke wastafel. Kumpulkan dalam botol kaca atau jerigen karena minyak ini bisa didaur ulang menjadi biodiesel.</p>
      <br/>
      <h4>4. Kompos Sisa Makanan</h4>
      <p>Sampah organik menyumbang bau paling parah. Jika Anda punya sedikit lahan, buatlah lubang biopori atau beli komposter sederhana untuk mengubah sisa makanan menjadi pupuk.</p>
      <br/>
      <h4>5. Setor ke Bank Sampah</h4>
      <p>Setelah sampah anorganik terkumpul dan bersih, setor ke pengepul atau gunakan fitur Pickup di aplikasi ini untuk menukarnya menjadi uang/poin!</p>
    `
  };

  return (
    <div className="app-container" style={{ background: "white", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ padding: "1.5rem 5% 1rem 5%", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10, background: "white" }}>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: "50%", padding: "0", cursor: "pointer", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={18} color="#1e293b" />
        </button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: "50%", padding: "0", cursor: "pointer", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={18} color="#ef4444" />
          </button>
          <button style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: "50%", padding: "0", cursor: "pointer", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Share2 size={18} color="#1e293b" />
          </button>
        </div>
      </div>

      {/* Hero Image Placeholder */}
      <div style={{ height: "200px", background: "linear-gradient(135deg, #dcfce7 0%, #e0f2fe 100%)", margin: "0 5%", borderRadius: "20px", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{color: "#166534", fontWeight: "bold"}}>Gambar Artikel</span>
      </div>

      {/* Content */}
      <div style={{ padding: "0 5%" }}>
        <span style={{ display: "inline-block", background: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "700", marginBottom: "1rem" }}>{article.category}</span>
        
        <h1 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", margin: "0 0 1rem 0", lineHeight: "1.3" }}>
          {article.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1.5rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={20} color="#94a3b8" />
          </div>
          <div>
            <p style={{ margin: "0 0 0.2rem 0", fontSize: "0.85rem", fontWeight: "700", color: "#1e293b" }}>{article.author}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#94a3b8", fontWeight: "500" }}>
              <span>{article.date}</span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><Clock size={12} /> {article.readTime}</span>
            </div>
          </div>
        </div>

        <div 
          style={{ fontSize: "0.95rem", color: "#475569", lineHeight: "1.8" }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        ></div>
      </div>
    </div>
  );
}

export default ArticleDetail;
