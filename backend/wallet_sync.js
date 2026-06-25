const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'pilah_pilih'
});

const promisePool = pool.promise();

async function syncWallets() {
  try {
    // Cari user (termasuk petugas) yang belum punya wallet
    const [usersWithoutWallet] = await promisePool.query(`
      SELECT u.id, u.name, u.role
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE w.id IS NULL
    `);

    if (usersWithoutWallet.length === 0) {
      console.log("Semua user sudah memiliki wallet.");
      process.exit(0);
    }

    console.log(`Ditemukan ${usersWithoutWallet.length} user tanpa wallet. Memproses...`);

    for (const user of usersWithoutWallet) {
      await promisePool.query(
        "INSERT INTO wallets (user_id, balance) VALUES (?, 0)",
        [user.id]
      );
      console.log(`✓ Wallet dibuat untuk ${user.role}: ${user.name} (ID: ${user.id})`);
    }

    console.log("Sinkronisasi wallet berhasil.");
    process.exit(0);
  } catch (err) {
    console.error("Terjadi kesalahan sinkronisasi:", err);
    process.exit(1);
  }
}

syncWallets();
