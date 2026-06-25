require("dotenv").config();
const db = require("./config/db");
const bcrypt = require("bcryptjs");

async function seed() {
  const hash = await bcrypt.hash("admin123", 10);
  db.query(
    `INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@pilahpilih.id', ?, 'admin') ON DUPLICATE KEY UPDATE role='admin'`,
    [hash],
    (err) => {
      if (err) console.error("Error seeding admin:", err);
      else console.log("Admin seeded: admin@pilahpilih.id / admin123");
      process.exit();
    }
  );
}

seed();
