import pool from "./db.js";
import bcrypt from "bcrypt";

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

    // Now create default users
    await createUsers(connection);

  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    connection.release();
  }
}

async function createUsers(connection) {
  try {
    // Admin
    const adminPass = await bcrypt.hash("admin123", 10);
    await connection.execute(
      "INSERT IGNORE INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@example.com", adminPass, 1]
    );

    // Developer
    const userPass = await bcrypt.hash("user123", 10);
    await connection.execute(
      "INSERT IGNORE INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Developer", "user@example.com", userPass, 2]
    );

    // Viewer
    const viewerPass = await bcrypt.hash("viewer123", 10);
    await connection.execute(
      "INSERT IGNORE INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Viewer", "viewer@example.com", viewerPass, 3]
    );

    console.log("Users created ✅");
  } catch (err) {
    console.error("Error creating users:", err);
  }
}

// Run everything
initDatabase();
