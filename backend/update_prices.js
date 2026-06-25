const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pilah_pilih'
});

const promisePool = pool.promise();

async function updatePrices() {
  try {
    const prices = [
      ['Besi', 5000],
      ['Botol Plastik', 2000],
      ['Kardus', 1000],
      ['Buku/HPS', 1500]
    ];
    
    for (const [type, price] of prices) {
      await promisePool.query(
        'INSERT INTO waste_prices (waste_type, price_per_kg) VALUES (?, ?) ON DUPLICATE KEY UPDATE price_per_kg = ?',
        [type, price, price]
      );
      console.log(`Updated ${type} to ${price}`);
    }
    console.log("Prices updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updatePrices();
