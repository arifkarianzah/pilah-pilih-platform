require('dotenv').config();
const db = require('./config/db.js');

// Ambil ID user pertama untuk dijadikan pengirim tiket
db.query("SELECT id FROM users WHERE role = 'user' LIMIT 1", (err, users) => {
  if (err || users.length === 0) {
    console.log("Tidak ada user, tiket tidak di-seed.");
    process.exit();
  }
  
  const userId = users[0].id;
  
  const seedTickets = `
    INSERT IGNORE INTO tickets (id, user_id, subject, message, status) VALUES 
    ('TKT-001', ?, 'Saldo tidak bertambah setelah penjemputan', 'Halo admin, saya sudah melakukan penjemputan 3 hari lalu tapi saldo saya belum bertambah. Mohon dicek ya.', 'open'),
    ('TKT-002', ?, 'Petugas tidak datang sesuai jadwal', 'Sudah menunggu 2 jam tapi petugas tidak kunjung datang. Order saya PP-0237.', 'open')
  `;
  
  db.query(seedTickets, [userId, userId], (err2) => {
    if (err2) {
      console.error(err2.message);
      process.exit();
    }
    console.log("Seeded tickets.");
    process.exit();
  });
});
