const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'qhaay_db',
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS waiter_calls (
      id CHAR(36) PRIMARY KEY,
      restaurant_id CHAR(36) NOT NULL,
      table_number INT NOT NULL,
      customer_id CHAR(36),
      status ENUM('pending', 'resolved') DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);
  console.log("Table created successfully");
  process.exit(0);
}
run().catch(console.error);
