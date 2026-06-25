require('dotenv').config();
const db = require('./config/db.js');

const createTickets = `
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(20) PRIMARY KEY,
    user_id INT,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'replied', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

const createReplies = `
CREATE TABLE IF NOT EXISTS ticket_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(20),
    sender_role ENUM('user', 'admin') DEFAULT 'admin',
    reply TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);`;

db.query(createTickets, (err) => {
  if (err) { console.error("Error creating tickets:", err.message); process.exit(1); }
  console.log("tickets table created");
  
  db.query(createReplies, (err2) => {
    if (err2) { console.error("Error creating ticket_replies:", err2.message); process.exit(1); }
    console.log("ticket_replies table created");
    process.exit();
  });
});
