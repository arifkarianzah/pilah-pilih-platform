import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import { getPetugasList, getMessagesByUser, sendMessage } from '../api/pengepulAPI';
import PageHeader from '../components/UI/PageHeader';

const DUMMY_PETUGAS = [
  { id: 1, name: 'Andi Saputra', phone: '08123456789' },
  { id: 2, name: 'Budi Santoso', phone: '08987654321' },
];

const DUMMY_MESSAGES = {
  1: [
    { id: 1, sender_name: 'Andi Saputra', message: 'Pak, saya siap ambil sampah.', created_at: new Date(Date.now() - 3600000).toISOString(), sender_role: 'petugas' },
  ],
};

const Chat = () => {
  const [petugas, setPetugas] = useState([]);
  const [selectedPetugas, setSelectedPetugas] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchPetugas = async () => {
      try {
        const res = await getPetugasList();
        setPetugas(res.data);
      } catch {
        setPetugas(DUMMY_PETUGAS);
      } finally {
        setLoading(false);
      }
    };
    fetchPetugas();
  }, []);

  const [showArea, setShowArea] = useState(false);

  useEffect(() => {
    if (selectedPetugas) {
      setShowArea(true);
      const fetchMsgs = async () => {
        try {
          const res = await getMessagesByUser(selectedPetugas.id);
          setMessages(res.data.data || []);
        } catch {
          setMessages(DUMMY_MESSAGES[selectedPetugas.id] || []);
        }
      };
      fetchMsgs();
    } else {
      setShowArea(false);
    }
  }, [selectedPetugas]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedPetugas) return;
    setSending(true);
    const tmpMsg = {
      id: Date.now(),
      sender_name: user.name || 'Admin Pengepul',
      message: newMsg,
      created_at: new Date().toISOString(),
      sender_role: 'pengepul',
    };
    setMessages(prev => [...prev, tmpMsg]);
    setNewMsg('');
    try {
      await sendMessage({ pickup_id: null, receiver_id: selectedPetugas.id, message: newMsg });
    } catch {
      // optimistic update ok
    } finally {
      setSending(false);
    }
  };

  const handleBackToList = () => {
    setSelectedPetugas(null);
  };

  return (
    <div>
      <PageHeader title="Chat" subtitle="Komunikasi dengan admin dan petugas" />

      <div className={`chat-layout ${showArea ? 'show-area' : ''}`}>
        {/* Chat List */}
        <div className="chat-list">
          <div className="chat-list-header">
            <FiMessageSquare style={{ marginRight: 8 }} /> Kontak Petugas
          </div>
          <div className="chat-list-items">
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Memuat...</div>
            ) : petugas.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Belum ada petugas terdaftar.</div>
            ) : (
              petugas.map(p => (
                <div
                  key={p.id}
                  className={`chat-list-item ${selectedPetugas?.id === p.id ? 'active' : ''}`}
                  onClick={() => setSelectedPetugas(p)}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(16,185,129,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {p.name?.charAt(0) || 'P'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name || 'Petugas'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {p.phone || 'Petugas'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {!selectedPetugas ? (
            <div className="chat-area-placeholder" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 12 }}>
              <FiMessageSquare style={{ fontSize: 48, opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>Pilih petugas untuk mulai chat</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--surface)',
              }}>
                <button className="chat-back-btn" onClick={handleBackToList}>
                  ←
                </button>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(16,185,129,0.2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}>
                  {selectedPetugas.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedPetugas.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {selectedPetugas.phone || 'Petugas'}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 40 }}>
                    Belum ada pesan. Mulai percakapan!
                  </div>
                )}
                {messages.map(m => {
                  const isMine = m.sender_role === 'pengepul';
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      {!isMine && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.sender_name}</span>
                      )}
                      <div className={`chat-bubble ${isMine ? 'mine' : 'other'}`}>{m.message}</div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                        {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  className="input-control"
                  style={{ flex: 1 }}
                  placeholder="Tulis pesan..."
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" className="btn btn-primary btn-icon" disabled={!newMsg.trim() || sending}>
                  <FiSend />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
