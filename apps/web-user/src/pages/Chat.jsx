import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMessagesByUser, sendMessage } from "../services/messageService";
import { getMyPickups } from "../services/pickupService";
import { ArrowLeft, Send } from "lucide-react";

function Chat() {
  const { pickupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePickup, setActivePickup] = useState(null);
  const [allPickups, setAllPickups] = useState([]);
  
  const token = localStorage.getItem("token");
  let currentUser = {};
  if (token) {
    try {
      currentUser = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error("Gagal parse token", e);
    }
  }

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Ambil detail pickup (untuk tahu mau chat dengan siapa)
    const fetchPickups = async () => {
      try {
        const res = await getMyPickups();
        if (res.success) {
          setAllPickups(res.data);
          let targetPickup = null;
          if (pickupId) {
            targetPickup = res.data.find(p => p.id === parseInt(pickupId));
          } else if (res.data.length > 0) {
            targetPickup = res.data.find(p => p.petugas_id) || res.data[0];
          }
          setActivePickup(targetPickup);
        }
      } catch (err) {
        console.error("Gagal mengambil daftar pickup:", err);
      }
    };
    fetchPickups();
  }, [pickupId]);

  const fetchMessages = async () => {
    if (!activePickup || !activePickup.petugas_id) {
      setLoading(false);
      return;
    }
    try {
      const res = await getMessagesByUser(activePickup.petugas_id);
      if (res.success) {
        setMessages(res.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Gagal mengambil pesan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activePickup && activePickup.petugas_id) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [activePickup]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePickup || !activePickup.petugas_id) return;

    const receiverId = activePickup.petugas_id;

    const tempMessage = {
      id: Date.now(),
      pickup_id: null,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      message: newMessage,
      created_at: new Date().toISOString(),
      sender_name: currentUser.name,
      sender_role: currentUser.role
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    scrollToBottom();

    try {
      await sendMessage(activePickup.id, receiverId, tempMessage.message);
      fetchMessages();
    } catch (err) {
      console.error("Gagal mengirim pesan", err);
      alert("Gagal mengirim pesan");
    }
  };

  if (loading && !activePickup) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)'}}>Memuat...</div>;
  }

  if (!activePickup && allPickups.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>Chat Petugas</h2>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Belum ada transaksi penjemputan untuk dichat.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f1f5f9', height: '100dvh', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <style>{`
        .chat-container { width: 100%; max-width: 768px; margin: 0 auto; display: flex; flex-direction: column; height: 100%; background: #efeae2; font-family: 'Inter', sans-serif; box-shadow: 0 0 20px rgba(0,0,0,0.05); position: relative; }
        .chat-header { background: #075E54; padding: 1rem; display: flex; align-items: center; gap: 1rem; position: sticky; top: 0; z-index: 10; color: white; }
        .chat-header-title { font-size: 1.1rem; font-weight: 700; margin: 0; color: white; }
        .chat-header-subtitle { font-size: 0.8rem; color: rgba(255,255,255,0.8); margin: 0; font-weight: 400; text-transform: capitalize; }
        .chat-area { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
        
        .chat-bubble-wrapper { display: flex; flex-direction: column; margin-bottom: 0.5rem; }
        .chat-bubble { max-width: 80%; padding: 6px 8px 6px 12px; border-radius: 8px; font-size: 0.9rem; line-height: 1.4; position: relative; display: flex; flex-direction: column; box-shadow: 0 1px 0.5px rgba(11,20,26,.13); }
        .chat-bubble.me { background: #dcf8c6; color: #111b21; border-top-right-radius: 0; align-self: flex-end; }
        .chat-bubble.other { background: #ffffff; color: #111b21; border-top-left-radius: 0; align-self: flex-start; }
        
        .chat-bubble-name { font-size: 0.75rem; font-weight: 600; color: #0284c7; margin-bottom: 2px; }
        .chat-bubble-bottom { display: flex; justify-content: flex-end; align-items: flex-end; margin-top: 2px; gap: 4px; }
        .chat-bubble-time { font-size: 0.65rem; color: #667781; }
        
        .chat-input-wrapper { padding: 0.5rem 1rem; background: #f0f2f5; position: sticky; bottom: 0; z-index: 10; }
        .chat-input { flex: 1; padding: 10px 16px; border-radius: 24px; border: none; outline: none; background: #ffffff; font-size: 0.95rem; }
        .chat-send-btn { width: 44px; height: 44px; border-radius: 50%; color: white; border: none; display: flex; align-items: center; justify-content: center; transition: 0.2s; background: #00a884; }
        .chat-send-btn:disabled { background: #a6d8cc; cursor: not-allowed; }
        
        @media (max-width: 640px) {
          .chat-header { padding: 0.75rem 1rem; }
          .chat-header-title { font-size: 1rem; }
          .chat-header-subtitle { font-size: 0.75rem; }
          .chat-area { padding: 0.75rem; }
          .chat-bubble { max-width: 90%; font-size: 0.85rem; }
          .chat-input-wrapper { padding: 0.5rem; }
          .chat-input { padding: 10px 14px; font-size: 0.85rem; }
          .chat-send-btn { width: 40px; height: 40px; }
          .chat-send-btn svg { width: 18px; height: 18px; }
        }
      `}</style>
      
      <div className="chat-container">
        
        {/* HEADER */}
      <div className="chat-header">
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="chat-header-title">Chat dengan Petugas</h2>
          <p className="chat-header-subtitle">
            Order #{activePickup?.id} • {activePickup?.waste_type}
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chat-area">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Memuat chat...</div>
        ) : activePickup && !activePickup.petugas_id ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <p>Order kamu masih dalam status <strong>Menunggu</strong>.</p>
            <p style={{ fontSize: '0.85rem' }}>Fitur chat akan aktif setelah Petugas menerima pesananmu.</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Belum ada pesan. Mulai sapa Petugas!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className="chat-bubble-wrapper">
                <div className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                  {!isMe && (
                    <div className="chat-bubble-name">Petugas</div>
                  )}
                  <div>{msg.message}</div>
                  <div className="chat-bubble-bottom">
                    <span className="chat-bubble-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="chat-input-wrapper">
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="chat-input"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()} 
            className="chat-send-btn"
          >
            <Send size={20} style={{ marginLeft: -2 }} />
          </button>
        </form>
      </div>

      </div>
    </div>
  );
}

export default Chat;
