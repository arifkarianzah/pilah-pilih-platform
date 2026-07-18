import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPetugasContacts, getMessagesByUser, sendMessage } from "../services/messageService";
import { Search, Send, User, MessageCircle, ArrowLeft } from "lucide-react";

function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUserId = searchParams.get("userId");
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await getPetugasContacts();
      if (res.success) {
        setContacts(res.data);
      }
    } catch (err) {
      console.error("Gagal mengambil kontak:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    // If there's an initialUserId in URL, select that contact once contacts are loaded
    if (initialUserId && contacts.length > 0 && !activeContact) {
      const contact = contacts.find(c => c.id.toString() === initialUserId.toString());
      if (contact) {
        handleSelectContact(contact);
      }
    }
  }, [initialUserId, contacts]);

  const fetchMessages = async (contactId) => {
    setLoadingMessages(true);
    try {
      const res = await getMessagesByUser(contactId);
      if (res.success) {
        setMessages(res.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Gagal mengambil pesan:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id);
      const interval = setInterval(() => fetchMessages(activeContact.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    setSearchParams({ userId: contact.id });
  };

  const handleBackToList = () => {
    setActiveContact(null);
    setSearchParams({});
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const tempMessage = {
      id: Date.now(),
      pickup_id: null,
      sender_id: currentUser.id,
      receiver_id: activeContact.id,
      message: newMessage,
      created_at: new Date().toISOString(),
      sender_name: currentUser.name,
      sender_role: currentUser.role
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    scrollToBottom();

    try {
      // pickup_id is null for 1-on-1 chat
      await sendMessage(null, activeContact.id, tempMessage.message);
      fetchMessages(activeContact.id);
    } catch (err) {
      console.error("Gagal mengirim pesan", err);
      alert("Gagal mengirim pesan");
    }
  };

  const customStyles = `
    .chat-layout {
      display: flex;
      height: calc(100vh - 70px);
      background: #efeae2;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .chat-sidebar {
      width: 350px;
      border-right: 1px solid #d1d7db;
      display: flex;
      flex-direction: column;
      background: white;
    }
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #efeae2;
    }
    .wa-header {
      background: #008069;
      color: white;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      height: 60px;
      flex-shrink: 0;
    }
    .wa-header h2, .wa-header h3 {
      margin: 0;
      color: white;
      font-weight: 600;
    }
    .wa-search {
      background: #f0f2f5;
      padding: 0.5rem 0.8rem;
      border-bottom: 1px solid #f2f2f2;
    }
    .wa-search-inner {
      background: white;
      border-radius: 8px;
      padding: 0.4rem 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .wa-search-inner input {
      border: none;
      outline: none;
      width: 100%;
      background: transparent;
      font-size: 0.9rem;
    }
    .contact-item {
      padding: 0 1rem;
      display: flex;
      align-items: stretch;
      gap: 1rem;
      cursor: pointer;
      background: white;
      transition: background 0.2s;
    }
    .contact-item:hover, .contact-item.active {
      background: #f0f2f5;
    }
    .contact-content {
      flex: 1;
      border-bottom: 1px solid #f2f2f2;
      padding: 0.8rem 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .contact-item:last-child .contact-content {
      border-bottom: none;
    }
    .msg-bubble {
      max-width: 85%;
      padding: 6px 7px 8px 9px;
      border-radius: 8px;
      box-shadow: 0 1px 0.5px rgba(11,20,26,.13);
      font-size: 0.95rem;
      line-height: 19px;
      position: relative;
      margin-bottom: 2px;
    }
    .msg-mine {
      background: #d9fdd3;
      color: #111b21;
      border-top-right-radius: 0;
    }
    .msg-theirs {
      background: white;
      color: #111b21;
      border-top-left-radius: 0;
    }
    .msg-time {
      font-size: 0.68rem;
      color: #667781;
      float: right;
      margin-top: 4px;
      margin-left: 10px;
    }
    .chat-bg {
      background-color: #efeae2;
      background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
      background-size: 400px;
      background-blend-mode: multiply;
      opacity: 0.6;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 0;
    }
    .chat-input-area {
      background: #f0f2f5;
      padding: 10px 1rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
      z-index: 10;
    }
    .chat-input-wrapper {
      flex: 1;
      background: white;
      border-radius: 24px;
      padding: 9px 12px;
      display: flex;
      align-items: center;
    }
    .chat-input-wrapper input {
      border: none;
      outline: none;
      width: 100%;
      font-size: 0.95rem;
    }
    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #00a884;
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .send-btn:disabled {
      background: #a9a9a9;
    }
    
    @media (max-width: 768px) {
      .chat-layout { height: 100vh; }
      .chat-sidebar {
        width: 100%;
        display: ${activeContact ? 'none' : 'flex'};
      }
      .chat-main {
        display: ${activeContact ? 'flex' : 'none'};
      }
      .bottom-nav { display: none !important; }
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="chat-layout">
        
        {/* SIDEBAR */}
        <div className="chat-sidebar">
          <div className="wa-header">
            <button 
              className="d-md-none" 
              onClick={() => navigate('/dashboard')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <ArrowLeft size={24} color="white" />
            </button>
            <h2 style={{ fontSize: '1.25rem' }}>WhatsApp Petugas</h2>
          </div>
          
          <div className="wa-search">
            <div className="wa-search-inner">
              <Search size={18} color="#8696a0" />
              <input 
                type="text" 
                placeholder="Cari atau mulai chat baru" 
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingContacts ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#8696a0' }}>Memuat kontak...</div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#8696a0' }}>Belum ada kontak.</div>
            ) : (
              contacts.map(c => (
                <div 
                  key={c.id} 
                  className={`contact-item ${activeContact?.id === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectContact(c)}
                >
                  <div style={{ padding: '0.6rem 0' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dfe5e7', color: '#8696a0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={28} />
                    </div>
                  </div>
                  <div className="contact-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#111b21', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#667781' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.85rem', color: '#667781', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.role}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="chat-main" style={{ position: 'relative' }}>
          {activeContact ? (
            <>
              {/* WA Header */}
              <div className="wa-header">
                <button 
                  onClick={handleBackToList}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  <ArrowLeft size={24} color="white" />
                </button>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dfe5e7', color: '#8696a0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem' }}>{activeContact.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>{activeContact.role}</p>
                </div>
              </div>

              {/* Messages Area */}
              <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-bg"></div>
                <div style={{ flex: 1, padding: '1rem 4%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem', zIndex: 1 }}>
                  {loadingMessages && messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#8696a0' }}>Memuat pesan...</div>
                  ) : messages.length === 0 ? (
                    <div style={{ margin: '1rem auto', background: '#ffeecd', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#54656f', textAlign: 'center', boxShadow: '0 1px 0.5px rgba(11,20,26,.13)' }}>
                      Pesan ini dienkripsi secara end-to-end. Tidak ada seorang pun di luar chat ini, yang dapat membaca atau mendengarkannya.
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender_id === currentUser.id;
                      return (
                        <div key={msg.id || idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', margin: '2px 0' }}>
                          <div className={`msg-bubble ${isMe ? 'msg-mine' : 'msg-theirs'}`}>
                            <span>{msg.message}</span>
                            <span className="msg-time">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                <div className="chat-input-wrapper">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan"
                  />
                </div>
                <button 
                  type="submit" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()} 
                  className="send-btn"
                >
                  <Send size={18} style={{ marginLeft: -2 }} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', zIndex: 1 }}>
              <MessageCircle size={80} color="#d1d7db" style={{ marginBottom: '2rem' }} />
              <h1 style={{ margin: 0, fontWeight: 300, color: '#41525d', fontSize: '2rem' }}>Pilah Pilih WhatsApp</h1>
              <p style={{ marginTop: '1rem', color: '#8696a0', fontSize: '0.9rem' }}>Pilih kontak di sebelah kiri untuk mulai mengirim pesan.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default Chat;
