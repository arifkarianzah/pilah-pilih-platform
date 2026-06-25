const db = require("../config/db");

// Ambil semua notifikasi untuk user
exports.getNotifications = (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("DB Error in getNotifications SELECT:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
    
    // Jika tidak ada notifikasi, buatkan beberapa dummy notifikasi untuk demonstrasi jika ini user baru (opsional, tapi bagus untuk demo)
    if (results.length === 0) {
      const insertDummy = `
        INSERT INTO notifications (user_id, title, message) VALUES 
        (?, 'Selamat Datang!', 'Selamat datang di aplikasi Pilah Pilih!'),
        (?, 'Poin Bertambah', 'Anda mendapatkan 50 poin dari pendaftaran.'),
        (?, 'Tips Pilah Sampah', 'Pisahkan sampah organik dan anorganik untuk memudahkan daur ulang.')
      `;
      db.query(insertDummy, [userId, userId, userId], (errInsert) => {
        if (errInsert) {
            console.error("DB Error in getNotifications INSERT:", errInsert);
            return res.status(500).json({ success: false, message: errInsert.message });
        }
        // Ambil ulang
        db.query(sql, [userId], (err2, results2) => {
          if (err2) return res.status(500).json({ success: false, message: err2.message });
          return res.json({ success: true, notifications: results2 });
        });
      });
    } else {
      res.json({
        success: true,
        notifications: results
      });
    }
  });
};

// Tandai semua notifikasi sudah dibaca
exports.markAllRead = (req, res) => {
  const userId = req.user.id;

  const sql = "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    res.json({
      success: true,
      message: "Semua notifikasi telah ditandai dibaca"
    });
  });
};

// Tandai satu notifikasi sudah dibaca
exports.markAsRead = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const sql = "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?";
  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    res.json({
      success: true,
      message: "Notifikasi ditandai dibaca"
    });
  });
};
