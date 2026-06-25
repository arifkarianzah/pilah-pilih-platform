const db = require('../config/db');

exports.getAllTickets = (req, res) => {
  const sql = `
    SELECT t.*, u.name as user_name, u.email as user_email
    FROM tickets t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `;
  db.query(sql, (err, tickets) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    db.query("SELECT * FROM ticket_replies ORDER BY created_at ASC", (err2, replies) => {
      if (err2) return res.status(500).json({ success: false, message: err2.message });
      
      const mapped = tickets.map(t => {
        return {
          id: t.id,
          user: t.user_name,
          email: t.user_email,
          subjek: t.subject,
          pesan: t.message,
          status: t.status,
          tgl: new Date(t.created_at).toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          balasan: replies.filter(r => r.ticket_id === t.id).map(r => 
            `${r.sender_role === 'admin' ? 'Admin' : 'User'}: ${r.reply}`
          )
        };
      });
      res.json({ success: true, data: mapped });
    });
  });
};

exports.replyTicket = (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  if (!reply) return res.status(400).json({ success: false, message: "Reply cannot be empty" });

  db.query("INSERT INTO ticket_replies (ticket_id, sender_role, reply) VALUES (?, 'admin', ?)", [id, reply], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.query("UPDATE tickets SET status = 'replied' WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: err2.message });
      res.json({ success: true, message: "Ticket replied" });
    });
  });
};

exports.closeTicket = (req, res) => {
  const { id } = req.params;
  db.query("UPDATE tickets SET status = 'closed' WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Ticket closed" });
  });
};
