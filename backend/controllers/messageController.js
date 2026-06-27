const db = require("../config/db");

// ============================================================
// AMBIL PESAN BERDASARKAN PICKUP ID
// ============================================================
exports.getMessagesByPickupId = (req, res) => {
    const { pickupId } = req.params;
    const userId = req.user.id;

    // Tandai pesan sebagai dibaca (is_read = 1) jika receiver_id adalah user saat ini
    const updateSql = `UPDATE messages SET is_read = 1 WHERE pickup_id = ? AND receiver_id = ? AND is_read = 0`;
    db.query(updateSql, [pickupId, userId], (updateErr) => {
        if (updateErr) console.error("Gagal update is_read:", updateErr);
        
        const sql = `
            SELECT m.*, u.name as sender_name, u.role as sender_role 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.pickup_id = ?
            ORDER BY m.created_at ASC
        `;

        db.query(sql, [pickupId], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: results });
        });
    });
};

// ============================================================
// AMBIL JUMLAH PESAN BELUM DIBACA
// ============================================================
exports.getUnreadCount = (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = 0`;
    
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, count: results[0].unread_count });
    });
};

// ============================================================
// KIRIM PESAN BARU
// ============================================================
exports.sendMessage = (req, res) => {
    let { pickup_id, receiver_id, message } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !message) {
        return res.status(400).json({ success: false, message: "Receiver ID dan message harus diisi" });
    }

    if (!pickup_id) {
        const findSql = `
            SELECT id FROM pickups 
            WHERE (user_id = ? AND petugas_id = ?) 
               OR (user_id = ? AND petugas_id = ?)
               OR (petugas_id = ? AND pengepul_id = ?)
               OR (petugas_id = ? AND pengepul_id = ?)
            ORDER BY id DESC LIMIT 1
        `;
        db.query(findSql, [sender_id, receiver_id, receiver_id, sender_id, sender_id, receiver_id, receiver_id, sender_id], (err, pickups) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            
            if (pickups.length > 0) {
                pickup_id = pickups[0].id;
                insertMessage();
            } else {
                return res.status(400).json({ success: false, message: "Tidak ada transaksi terkait antara kedua pengguna" });
            }
        });
    } else {
        insertMessage();
    }

    function insertMessage() {
        const sql = `
            INSERT INTO messages (pickup_id, sender_id, receiver_id, message)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [pickup_id, sender_id, receiver_id, message], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            const fetchSql = `
                SELECT m.*, u.name as sender_name, u.role as sender_role 
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.id = ?
            `;
            db.query(fetchSql, [result.insertId], (errFetch, fetchResults) => {
                if (errFetch) return res.status(500).json({ success: false, message: errFetch.message });
                res.status(201).json({ success: true, message: "Pesan terkirim", data: fetchResults[0] });
            });
        });
    }
};

// ============================================================
// AMBIL PESAN BERDASARKAN USER (1-ON-1)
// ============================================================
exports.getMessagesByUser = (req, res) => {
    const { userId } = req.params; // ID lawan bicara
    const currentUserId = req.user.id;

    // Tandai pesan sebagai dibaca
    const updateSql = `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`;
    db.query(updateSql, [userId, currentUserId], (updateErr) => {
        if (updateErr) console.error("Gagal update is_read:", updateErr);
        
        const sql = `
            SELECT m.*, u.name as sender_name, u.role as sender_role 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;

        db.query(sql, [userId, currentUserId, currentUserId, userId], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: results });
        });
    });
};
