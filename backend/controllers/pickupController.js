const db = require("../config/db");

// Helper function to log status change
const logStatusChange = (pickupId, status, changedBy) => {
    db.query(
        "INSERT INTO pickup_status_logs (pickup_id, status, changed_by) VALUES (?, ?, ?)",
        [pickupId, status, changedBy]
    );
    // Emit socket event if io is available
    if (global.io) {
        global.io.emit("pickup_status_changed", { pickupId, status });
    }
};

// ============================================================
// USER — Buat Permintaan Penjemputan
// ============================================================
exports.createPickup = (req, res) => {
    const { address, waste_type, estimated_weight, pickup_date, notes } = req.body;
    const user_id = req.user.id;

    const sql = `
        INSERT INTO pickups
        (user_id, address, waste_type, estimated_weight, pickup_date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, address, waste_type, estimated_weight, pickup_date, notes], (err, result) => {
        if(err) return res.status(500).json({ success: false, message: err.message });
        
        logStatusChange(result.insertId, 'pending', user_id);
        
        res.status(201).json({ success: true, message: "Permintaan penjemputan berhasil dibuat", pickup_id: result.insertId });
    });
};

// ============================================================
// USER — Lihat Riwayat Pickup Sendiri
// ============================================================
exports.getMyPickups = (req, res) => {
    const user_id = req.user.id;
    db.query("SELECT * FROM pickups WHERE user_id = ? ORDER BY id DESC", [user_id], (err, result) => {
        if(err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: result });
    });
};

// ============================================================
// UNIVERSAL — Lihat Detail Pickup
// ============================================================
exports.getPickupById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM pickups WHERE id = ?", [id], (err, results) => {
        if(err) return res.status(500).json({ success: false, message: err.message });
        if(results.length === 0) return res.status(404).json({ success: false, message: "Pickup tidak ditemukan" });
        
        // Fetch photos and items if any
        db.query("SELECT * FROM pickup_photos WHERE pickup_id = ?", [id], (err2, photos) => {
            db.query("SELECT * FROM pickup_items WHERE pickup_id = ?", [id], (err3, items) => {
                const data = results[0];
                data.photos = photos || [];
                data.items = items || [];
                res.json({ success: true, data });
            });
        });
    });
};

// ============================================================
// PETUGAS — Lihat Semua Order Masuk (Pending)
// ============================================================
exports.getPendingPickups = (req, res) => {
    db.query("SELECT * FROM pickups WHERE status = 'pending' ORDER BY id ASC", (err, result) => {
        if(err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: result });
    });
};

// ============================================================
// PETUGAS — Lihat Order Aktif Sendiri
// ============================================================
exports.getMyActivePickups = (req, res) => {
    const petugas_id = req.user.id;
    db.query(
        "SELECT * FROM pickups WHERE petugas_id = ? AND status IN ('accepted', 'on_the_way', 'arrived', 'collected') ORDER BY id DESC",
        [petugas_id],
        (err, result) => {
            if(err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: result });
        }
    );
};

// ============================================================
// PETUGAS — Lihat Semua Order (Pending + Milik Sendiri)
// ============================================================
exports.getAllMyPickups = (req, res) => {
    const petugas_id = req.user.id;
    db.query(
        "SELECT * FROM pickups WHERE status = 'pending' OR petugas_id = ? ORDER BY id DESC",
        [petugas_id],
        (err, result) => {
            if(err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: result });
        }
    );
};

// ============================================================
// PETUGAS — Update Status (Terima, Mulai Perjalanan, Tiba, Antar)
// ============================================================
exports.updateStatus = (req, res) => {
    const pickupId = req.params.id;
    const { status, cancel_reason, pengepul_id } = req.body;
    const user_id = req.user.id;

    let sql = "UPDATE pickups SET status = ?";
    let params = [status];

    if (status === 'accepted') {
        sql += ", petugas_id = ?";
        params.push(user_id);
    }
    
    if (status === 'waiting_collector') {
        if (!pengepul_id) return res.status(400).json({ success: false, message: "Pengepul tujuan wajib diisi" });
        sql += ", pengepul_id = ?";
        params.push(pengepul_id);
    }

    if (status === 'cancelled' && cancel_reason) {
        sql += ", cancel_reason = ?";
        params.push(cancel_reason);
    }

    sql += " WHERE id = ?";
    params.push(pickupId);

    db.query(sql, params, (err) => {
        if(err) {
            console.error("DB Error in updateStatus:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        logStatusChange(pickupId, status, user_id);
        res.json({ success: true, message: `Status order berhasil diupdate ke ${status}` });
    });
};

// ============================================================
// PETUGAS / PENGEPUL — Upload Foto Bukti
// ============================================================
exports.uploadPhoto = (req, res) => {
    const pickupId = req.params.id;
    const { photo_type } = req.body; // 'pickup_proof' atau 'weighing_proof'
    const user_id = req.user.id;

    if (!req.file) return res.status(400).json({ success: false, message: "File gambar wajib diunggah" });
    if (!photo_type) return res.status(400).json({ success: false, message: "Tipe foto wajib diisi" });

    const file_path = "/uploads/pickups/" + req.file.filename;

    db.query(
        "INSERT INTO pickup_photos (pickup_id, uploaded_by, photo_type, file_path) VALUES (?, ?, ?, ?)",
        [pickupId, user_id, photo_type, file_path],
        (err) => {
            if(err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: "Foto berhasil diunggah", file_path });
        }
    );
};

// ============================================================
// PENGEPUL — Lihat Order Menunggu
// ============================================================
exports.getWaitingPickups = (req, res) => {
    const pengepul_id = req.user.id;
    const q = `
        SELECT p.*, 
               u.name as user_name, 
               pt.name as petugas_name 
        FROM pickups p 
        LEFT JOIN users u ON p.user_id = u.id 
        LEFT JOIN users pt ON p.petugas_id = pt.id 
        WHERE p.pengepul_id = ? 
          AND p.status IN ('waiting_collector', 'weighing', 'completed') 
        ORDER BY p.id DESC
    `;
    db.query(q, [pengepul_id], (err, result) => {
        if(err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: result });
    });
};

// ============================================================
// PENGEPUL — Input Penimbangan & Hitung Harga
// ============================================================
exports.weighItems = (req, res) => {
    const pickupId = req.params.id;
    const { items } = req.body; // array of { waste_type, weight }
    const user_id = req.user.id;

    // Bersihkan items lama jika ada
    db.query("DELETE FROM pickup_items WHERE pickup_id = ?", [pickupId], (err) => {
        if(err) return res.status(500).json({ success: false, message: err.message });

        db.query("SELECT * FROM waste_prices", (errPrices, prices) => {
            if(errPrices) return res.status(500).json({ success: false, message: errPrices.message });
            
            let totalOrderPrice = 0;
            const insertPromises = items.map(item => {
                return new Promise((resolve, reject) => {
                    const priceRow = prices.find(p => p.waste_type === item.waste_type);
                    const price_per_kg = priceRow ? priceRow.price_per_kg : 0;
                    const total_price = price_per_kg * item.weight;
                    totalOrderPrice += total_price;

                    db.query(
                        "INSERT INTO pickup_items (pickup_id, waste_type, weight, price_per_kg, total_price) VALUES (?, ?, ?, ?, ?)",
                        [pickupId, item.waste_type, item.weight, price_per_kg, total_price],
                        (errInsert) => {
                            if (errInsert) reject(errInsert);
                            else resolve();
                        }
                    );
                });
            });

            Promise.all(insertPromises).then(() => {
                db.query("UPDATE pickups SET total_price = ?, status = 'weighing' WHERE id = ?", [totalOrderPrice, pickupId], (errUpd) => {
                    if(errUpd) return res.status(500).json({ success: false, message: errUpd.message });
                    logStatusChange(pickupId, 'weighing', user_id);
                    res.json({ success: true, message: "Data timbangan berhasil disimpan", totalOrderPrice });
                });
            }).catch(e => {
                res.status(500).json({ success: false, message: e.message });
            });
        });
    });
};

// ============================================================
// PENGEPUL — Konfirmasi Transaksi & Selesaikan
// ============================================================
exports.confirmAndComplete = (req, res) => {
    const pickupId = req.params.id;
    const pengepul_id = req.user.id;

    db.query("SELECT * FROM pickups WHERE id = ?", [pickupId], (err, results) => {
        if(err) return res.status(500).json({ success: false, message: err.message });
        if(results.length === 0) return res.status(404).json({ success: false, message: "Order tidak ditemukan" });

        const pickup = results[0];
        if (pickup.status !== 'weighing') return res.status(400).json({ success: false, message: "Order belum ditimbang!" });

        // Update status ke completed
        db.query("UPDATE pickups SET status = 'completed' WHERE id = ?", [pickupId], (errUpd) => {
            if(errUpd) return res.status(500).json({ success: false, message: errUpd.message });

            // Tambah Saldo Nasabah
            db.query("UPDATE wallets SET balance = balance + ? WHERE user_id = ?", [pickup.total_price, pickup.user_id]);
            db.query(
                "INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, 'credit', ?)",
                [pickup.user_id, pickup.total_price, `Penjualan Sampah Order #${pickup.id}`]
            );

            // Tambah Insentif Petugas
            const insentif = 5000; // Misal flat rate
            db.query("INSERT INTO petugas_earnings (petugas_id, pickup_id, amount) VALUES (?, ?, ?)", [pickup.petugas_id, pickup.id, insentif]);
            db.query("UPDATE wallets SET balance = balance + ? WHERE user_id = ?", [insentif, pickup.petugas_id]);
            db.query(
                "INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, 'credit', ?)",
                [pickup.petugas_id, insentif, `Insentif Penjemputan Order #${pickup.id}`]
            );

            logStatusChange(pickupId, 'completed', pengepul_id);
            res.json({ success: true, message: "Transaksi dikonfirmasi, saldo nasabah telah ditambahkan." });
        });
    });
};

// ============================================================
// PETUGAS — Ambil Daftar Kontak Chat
// ============================================================
exports.getPetugasContacts = (req, res) => {
    const petugasId = req.user.id;
    db.query("SELECT id, name, email, phone, role FROM users WHERE role = 'pengepul'", (err, pengepul) => {
        if(err) return res.status(500).json({ success: false, message: err.message });
        const sqlUsers = `
            SELECT DISTINCT u.id, u.name, u.email, u.phone, u.role
            FROM pickups p
            JOIN users u ON p.user_id = u.id
            WHERE p.petugas_id = ? AND p.status IN ('accepted', 'on_the_way', 'arrived', 'collected')
        `;
        db.query(sqlUsers, [petugasId], (err, users) => {
            if(err) return res.status(500).json({ success: false, message: err.message });
            const contacts = [...pengepul, ...users];
            const uniqueContacts = Array.from(new Map(contacts.map(c => [c.id, c])).values());
            res.json({ success: true, data: uniqueContacts });
        });
    });
};
