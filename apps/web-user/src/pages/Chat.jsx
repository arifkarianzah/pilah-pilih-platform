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
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '768px', display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)', fontFamily: 'Inter, sans-serif', boxShadow: '0 0 20px rgba(0,0,0,0.05)', position: 'relative' }}>
        
        {/* HEADER */}
      <div style={{ background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--surface-border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>Chat dengan Petugas</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500, textTransform: 'capitalize' }}>
            Order #{activePickup?.id} • {activePickup?.waste_type}
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: isMe ? '16px' : '4px',
                  background: isMe ? 'var(--primary)' : 'white',
                  color: isMe ? 'white' : 'var(--text-color)',
                  border: isMe ? 'none' : '1px solid var(--surface-border)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  {!isMe && (
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--primary)", marginBottom: "2px" }}>
                      Petugas
                    </div>
                  )}
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{msg.message}</div>
                  <div style={{ fontSize: '0.65rem', marginTop: '4px', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', textAlign: 'right' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid var(--surface-border)' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--surface-border)', outline: 'none', background: 'var(--bg-color)', fontSize: '0.95rem' }}
          />
          <button type="submit" disabled={!newMessage.trim()} style={{ width: 46, height: 46, borderRadius: '50%', background: newMessage.trim() ? 'var(--primary)' : 'var(--surface-border)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: '0.2s' }}>
            <Send size={20} style={{ marginLeft: -2 }} />
          </button>
        </form>
      </div>

      </div>
    </div>
  );
}

export default Chat;
