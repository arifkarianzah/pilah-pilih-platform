import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, BookOpen, Search, Leaf, Recycle, User, Clock, Heart, Wine, Globe2 } from "lucide-react";

const ARTICLES = [
  {
    id: 1,
    title: "5 Cara Mudah Pilah Sampah di Rumah",
    subtitle: "Memilah sampah tidak perlu sulit. Dengan 5 langkah sederhana ini...",
    badge: "Tips & Trik",
    category: "Tips",
    author: "Admin",
    readTime: "5 mnt baca",
    likes: 248,
    icon: <Recycle size={48} color="#16a34a" />,
    bgVariant: "featured" // the big one
  },
  {
    id: 2,
    title: "Plastik PET: Dari Sampah Jadi Bernilai",
    subtitle: "",
    badge: "Daur Ulang",
    category: "Daur Ulang",
    author: "",
    readTime: "3 mnt baca",
    likes: 0,
    icon: <Wine size={32} color="#a855f7" />,
    bgVariant: "list"
  },
  {
    id: 3,
    title: "Carbon Footprint: Apa dan Bagaimana Menguranginya",
    subtitle: "",
    badge: "Lingkungan",
    category: "Semua", // Shows only in Semua for now
    author: "",
    readTime: "7 mnt baca",
    likes: 0,
    icon: <Globe2 size={32} color="#3b82f6" />,
    bgVariant: "list"
  },
  {
    id: 4,
    title: "Video: Tutorial Membuat Kompos Sendiri",
    subtitle: "",
    badge: "Video",
    category: "Video",
    author: "",
    readTime: "10 mnt tonton",
    likes: 0,
    icon: <Leaf size={32} color="#f59e0b" />,
    bgVariant: "list"
  }
];

function Edukasi() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Semua");
  const TABS = ["Semua", "Daur Ulang", "Tips", "Video"];

  const filteredArticles = ARTICLES.filter(article => {
    if (activeTab === "Semua") return true;
    return article.category === activeTab;
  });

  return (
    <div className="app-container" style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ background: "white", padding: "1.5rem 5% 1rem 5%", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #f1f5f9" }}>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: "50%", padding: "0", cursor: "pointer", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={18} color="#1e293b" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookOpen size={20} color="#f97316" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Edukasi Lingkungan</h2>
        </div>
        <button style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: "50%", padding: "0", cursor: "pointer", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Search size={18} color="#8b5cf6" />
        </button>
      </div>

      <div className="main-content" style={{ padding: "1.5rem 5%" }}>
        
        {/* Banner Card */}
        <div style={{ background: "linear-gradient(135deg, #115e59 0%, #064e3b 100%)", borderRadius: "20px", padding: "2rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: "1.5rem", boxShadow: "0 10px 25px rgba(6,78,59,0.15)" }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.1 }}>
            <Leaf size={120} color="white" />
          </div>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <Leaf size={40} color="#6ee7b7" />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "white", margin: "0 0 0.25rem 0", position: "relative", zIndex: 2 }}>Belajar Kelola Sampah</h2>
          <p style={{ fontSize: "0.85rem", color: "#a7f3d0", margin: 0, position: "relative", zIndex: 2 }}>Jadilah pahlawan lingkungan</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", msOverflowStyle: "none", scrollbarWidth: "none", paddingBottom: "1rem", marginBottom: "0.5rem" }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: "0 0 auto",
                width: "max-content",
                whiteSpace: "nowrap",
                padding: "0.5rem 1.25rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                background: activeTab === tab ? "#ecfdf5" : "white",
                color: activeTab === tab ? "var(--brand-green)" : "#64748b",
                border: activeTab === tab ? "1px solid var(--brand-green)" : "1px solid #e2e8f0",
                transition: "all 0.2s"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Articles List */}
        {filteredArticles.length === 0 ? (
           <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
             <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: "1rem" }} />
             <p>Belum ada artikel untuk kategori ini.</p>
           </div>
        ) : (
          filteredArticles.map(article => {
            if (article.bgVariant === "featured") {
              return (
                <Link to={`/edukasi/${article.id}`} key={article.id} style={{ display: "block", textDecoration: "none", color: "inherit", background: "white", borderRadius: "20px", overflow: "hidden", marginBottom: "1rem", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                  <div style={{ background: "linear-gradient(180deg, #e0f2fe 0%, #f0fdf4 100%)", height: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {article.icon}
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <span style={{ display: "inline-block", background: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.65rem", fontWeight: "700", marginBottom: "0.75rem" }}>{article.badge}</span>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0", lineHeight: "1.4" }}>{article.title}</h3>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1rem 0", lineHeight: "1.5" }}>{article.subtitle}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <User size={12} color="#94a3b8" />
                        <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "500" }}>{article.author}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={12} color="#94a3b8" />
                        <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "500" }}>{article.readTime}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Heart size={12} color="#ef4444" fill="#ef4444" />
                        <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "500" }}>{article.likes} suka</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            } else {
              // List item variant
              return (
                <Link to={`/edukasi/${article.id}`} key={article.id} style={{ display: "flex", textDecoration: "none", color: "inherit", background: "white", borderRadius: "20px", alignItems: "stretch", marginBottom: "1rem", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", overflow: "hidden" }}>
                  <div style={{ width: "90px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {article.icon}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <span style={{ display: "inline-block", background: article.badge === "Daur Ulang" ? "#e0f2fe" : "#dcfce7", color: article.badge === "Daur Ulang" ? "#0369a1" : "#166534", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.65rem", fontWeight: "700", marginBottom: "0.5rem" }}>{article.badge}</span>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#0f172a", margin: "0 0 0.5rem 0", lineHeight: "1.4" }}>{article.title}</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Clock size={12} color="#94a3b8" />
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "500" }}>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              );
            }
          })
        )}

      </div>

      <BottomNav />
    </div>
  );
}

export default Edukasi;
