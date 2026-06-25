const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ============================================================
// REGISTER (user biasa - role default 'user')
// ============================================================
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) return res.status(409).json({ success: false, message: "Email sudah terdaftar" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });

      db.query("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", [result.insertId], (errWallet) => {
        if (errWallet) return res.status(500).json({ success: false, message: errWallet.message });
        return res.status(201).json({ success: true, message: "Register berhasil" });
      });
    });
  });
};

// ============================================================
// REGISTER PETUGAS (role = 'petugas')
// ============================================================
exports.registerPetugas = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password minimal 6 karakter" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) return res.status(409).json({ success: false, message: "Email sudah terdaftar" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'petugas')",
      [name, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        // Buat wallet untuk petugas
        db.query("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", [result.insertId], (errWallet) => {
          if (errWallet) return res.status(500).json({ success: false, message: errWallet.message });
          return res.status(201).json({ success: true, message: "Akun petugas berhasil dibuat! Silakan login." });
        });
      }
    );
  });
};

// ============================================================
// REGISTER PENGEPUL (role = 'pengepul')
// ============================================================
exports.registerPengepul = (req, res) => {
  const { name, email, password, phone, company_name, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password minimal 6 karakter" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) return res.status(409).json({ success: false, message: "Email sudah terdaftar" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query(
      "INSERT INTO users (name, email, password, role, phone, company_name, address) VALUES (?, ?, ?, 'pengepul', ?, ?, ?)",
      [name, email, hashedPassword, phone || null, company_name || null, address || null],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        // Buat wallet untuk pengepul
        db.query("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", [result.insertId], (errWallet) => {
          if (errWallet) return res.status(500).json({ success: false, message: errWallet.message });
          return res.status(201).json({ success: true, message: "Akun pengepul berhasil dibuat! Silakan login." });
        });
      }
    );
  });
};

// ============================================================
// REGISTER ADMIN (role = 'admin')
// ============================================================
exports.registerAdmin = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password minimal 6 karakter" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) return res.status(409).json({ success: false, message: "Email sudah terdaftar" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')",
      [name, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        // Buat wallet untuk admin (walaupun jarang dipakai, tetap dibuat untuk keseragaman relasi)
        db.query("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", [result.insertId], (errWallet) => {
          if (errWallet) return res.status(500).json({ success: false, message: errWallet.message });
          return res.status(201).json({ success: true, message: "Akun admin berhasil dibuat! Silakan login." });
        });
      }
    );
  });
};

// ============================================================
// LOGIN
// ============================================================
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.length === 0) return res.status(404).json({ success: false, message: "Email tidak ditemukan" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ success: false, message: "Password salah" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
};

// ============================================================
// PROFILE (protected)
// ============================================================
exports.profile = (req, res) => {
  db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    res.json({ success: true, user: results[0] });
  });
};

// ============================================================
// UPDATE PROFILE (protected)
// ============================================================
exports.updateProfile = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Nama wajib diisi" });

  db.query("UPDATE users SET name = ? WHERE id = ?", [name, req.user.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Profil berhasil diperbarui" });
  });
};

// ============================================================
// LOGOUT
// ============================================================
exports.logout = (req, res) => {
  return res.status(200).json({ success: true, message: "Logout berhasil. Hapus token di sisi client." });
};
