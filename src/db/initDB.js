import pool from "./db.js";

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    // Create roles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);

    // Insert default roles (Admin, Developer, Viewer)
    await connection.execute(`
      INSERT IGNORE INTO roles (name) VALUES 
      ('Admin'), ('Developer'), ('Viewer')
    `);

    // Create users table
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

    console.log("Database initialized ✅");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    connection.release();
  }
}

initDatabase();
