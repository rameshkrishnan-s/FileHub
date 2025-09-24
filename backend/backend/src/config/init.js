// initDatabase.js
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    // ================= ROLES TABLE =================
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);

    await connection.execute(`
      INSERT IGNORE INTO roles (name) VALUES 
      ('Admin'), ('Developer'), ('Viewer')
    `);

    // ================= USERS TABLE =================
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);

    // ================= COMPANIES TABLE =================
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL
      )
    `);

    // ================= ASSEMBLIES TABLE =================
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assemblies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL
      )
    `);

    // ================= METADATA TABLE =================
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fileName VARCHAR(255) NOT NULL,
        filePath VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        type ENUM('file','folder') DEFAULT 'file',
        fileId INT,
        INDEX(fileId)
      )
    `);

    console.log("✅ All tables initialized successfully!");

    // Create default users
    await createUsers(connection);

  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    connection.release();
  }
}

async function createUsers(connection) {
  try {
    const adminPass = await bcrypt.hash("admin123", 10);
    await connection.execute(
      "INSERT IGNORE INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@example.com", adminPass, 1]
    );

    const devPass = await bcrypt.hash("user123", 10);
    await connection.execute(
      "INSERT IGNORE INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Developer", "user@example.com", devPass, 2]
    );

    const viewerPass = await bcrypt.hash("viewer123", 10);
    await connection.execute(
      "INSERT IGNORE INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Viewer", "viewer@example.com", viewerPass, 3]
    );

    console.log("✅ Default users created!");
  } catch (err) {
    console.error("❌ Error creating users:", err);
  }
}

// Run immediately if this file is executed directly
if (require.main === module) {
  initDatabase().then(() => process.exit(0));
}

// Export for usage in app
module.exports = { initDatabase };
