require("dotenv").config();
const db = require("./config/db");
const bcrypt = require("bcryptjs");

async function seed() {
  const hash = await bcrypt.hash("pengepul123", 10);
  db.query(
    `INSERT INTO users (name, email, password, role) 
     VALUES ('Juragan Rongsok', 'pengepul@pilahpilih.id', ?, 'pengepul') 
     ON DUPLICATE KEY UPDATE role='pengepul'`,
    [hash],
    (err) => {
      if (err) console.error("Error seeding pengepul:", err);
      else console.log("Pengepul seeded: pengepul@pilahpilih.id / pengepul123");
      process.exit();
    }
  );
}

seed();
