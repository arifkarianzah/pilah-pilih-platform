require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Migrations ─────────────────────────
// Karena skema database.sql sudah diupdate lengkap, auto-migration dinonaktifkan
// untuk menghindari konflik tipe data ENUM dan kolom baru.
const migrations = [
  // Pastikan id tabel messages AUTO_INCREMENT
  `ALTER TABLE messages MODIFY COLUMN id INT AUTO_INCREMENT`,
  // Izinkan pickup_id bernilai null di tabel messages
  `ALTER TABLE messages MODIFY COLUMN pickup_id INT NULL`,
  // Tabel waste_types (jenis sampah baru dengan icon & deskripsi)
  `CREATE TABLE IF NOT EXISTS waste_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(20) DEFAULT '♻️',
      description TEXT DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  // Seed jenis sampah jika kosong
  `INSERT IGNORE INTO waste_types (id, name, icon, description) VALUES
    (1,'Plastik PET','🍾','Botol plastik PET bening/biru'),
    (2,'Plastik Campur','🛍️','Plastik campuran berbagai jenis'),
    (3,'Kardus','📦','Kardus/karton bekas'),
    (4,'Besi','🔩','Besi tua dan logam berat'),
    (5,'Aluminium','🥫','Kaleng aluminium dan sejenisnya'),
    (6,'Kaca','🫙','Botol kaca dan pecahan kaca'),
    (7,'Kaleng','🥤','Kaleng bekas makanan/minuman'),
    (8,'Kertas','📰','Koran, majalah, dan kertas HVS')`,
  // Tabel price_history
  `CREATE TABLE IF NOT EXISTS price_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      waste_type VARCHAR(100) NOT NULL,
      old_price DECIMAL(10,2),
      new_price DECIMAL(10,2),
      changed_by INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  // Tabel pengepul_inventory
  `CREATE TABLE IF NOT EXISTS pengepul_inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pengepul_id INT NOT NULL,
      waste_type VARCHAR(100) NOT NULL,
      weight DECIMAL(10,2) DEFAULT 0.00,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_inventory (pengepul_id, waste_type)
  )`,
  // Tabel pengepul_sales (Penjualan ke Pabrik)
  `CREATE TABLE IF NOT EXISTS pengepul_sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pengepul_id INT NOT NULL,
      waste_type VARCHAR(100) NOT NULL,
      weight DECIMAL(10,2) NOT NULL,
      price_per_kg DECIMAL(15,2) NOT NULL,
      total_price DECIMAL(15,2) NOT NULL,
      status ENUM('draft', 'processing', 'completed') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  // Update tabel messages agar pickup_id bisa null untuk chat 1-on-1
  `ALTER TABLE messages MODIFY COLUMN pickup_id INT DEFAULT NULL`
];

migrations.forEach(sql => {
  db.query(sql, (err) => {
    if (err && !err.message.includes("Duplicate")) {
      console.warn("Migration warning:", err.message.slice(0, 80));
    }
  });
});

// (tabel notifications sudah di-migrate di atas)

// === Routes ===
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/pickups", require("./routes/pickupRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/pengepul", require("./routes/pengepulRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "API Pilah Pilih Berjalan" });
});

const PORT = process.env.PORT || 5000;

// Setup Socket.io
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

// Pass io to routes/controllers if needed, or make it global
global.io = io;

io.on("connection", (socket) => {
  console.log("A user connected via Socket.io:", socket.id);
  
  // Example: user joins a room based on their user ID
  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server & Socket.io berjalan di port ${PORT}`);
});
