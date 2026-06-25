import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getPetugasContacts, getMessagesByUser, sendMessage } from "../services/messageService";
import { Search, Send, User, MessageCircle, ArrowLeft } from "lucide-react";

function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUserId = searchParams.get("userId");

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
      height: calc(100vh - 70px); /* minus bottom nav */
      background: white;
      font-family: 'Inter', sans-serif;
    }
    .chat-sidebar {
      width: 320px;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      background: #f8fafc;
    }
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #f1f5f9;
    }
    .contact-item {
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 0.2s;
    }
    .contact-item:hover {
      background: white;
    }
    .contact-item.active {
      background: white;
      border-left: 4px solid var(--brand);
    }
    .msg-bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .msg-mine {
      background: var(--brand);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .msg-theirs {
      background: white;
      color: var(--text);
      border-bottom-left-radius: 4px;
      border: 1px solid var(--border);
    }
    
    @media (max-width: 768px) {
      .chat-sidebar {
        width: 100%;
        display: ${activeContact ? 'none' : 'flex'};
      }
      .chat-main {
        display: ${activeContact ? 'flex' : 'none'};
      }
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="chat-layout">
        
        {/* SIDEBAR */}
        <div className="chat-sidebar">
          <div style={{ padding: '1.25rem', background: 'white', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Pesan</h2>
            <div style={{ position: 'relative', marginTop: '1rem' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Cari kontak..." 
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border)', background: '#f8fafc', outline: 'none' }}
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingContacts ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat kontak...</div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada kontak.</div>
            ) : (
              contacts.map(c => (
                <div 
                  key={c.id} 
                  className={`contact-item ${activeContact?.id === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectContact(c)}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.role === 'pengepul' ? 'var(--brand)' : 'var(--primary-light)', color: c.role === 'pengepul' ? 'white' : 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={22} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{c.role}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="chat-main">
          {activeContact ? (
            <>
              {/* Header */}
              <div style={{ padding: '1rem', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', zIndex: 10 }}>
                <button 
                  className="d-md-none" // assume some responsive utility or just show on mobile
                  onClick={handleBackToList}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <ArrowLeft size={24} color="var(--text)" />
                </button>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: activeContact.role === 'pengepul' ? 'var(--brand)' : 'var(--primary-light)', color: activeContact.role === 'pengepul' ? 'white' : 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{activeContact.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{activeContact.role}</p>
                </div>
              </div>

              {/* Messages List */}
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingMessages && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Memuat pesan...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>Mulai percakapan dengan {activeContact.name}</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === currentUser.id;
                    return (
                      <div key={msg.id || idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div className={`msg-bubble ${isMe ? 'msg-mine' : 'msg-theirs'}`}>
                          <div>{msg.message}</div>
                          <div style={{ fontSize: '0.65rem', marginTop: '4px', opacity: 0.7, textAlign: 'right' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid var(--border)' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--border)', outline: 'none', background: '#f8fafc', fontSize: '0.95rem' }}
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()} 
                    style={{ width: 46, height: 46, borderRadius: '50%', background: newMessage.trim() ? 'var(--brand)' : 'var(--border)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: '0.2s' }}
                  >
                    <Send size={20} style={{ marginLeft: -2 }} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <MessageCircle size={40} color="var(--brand)" style={{ opacity: 0.5 }} />
              </div>
              <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>Pilah Pilih Chat</h3>
              <p style={{ marginTop: '0.5rem' }}>Pilih kontak di sebelah kiri untuk mulai mengobrol.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default Chat;
