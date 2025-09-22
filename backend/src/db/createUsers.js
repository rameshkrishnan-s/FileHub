// src/db/createUsers.js
import pool from "./db.js";
import bcrypt from "bcrypt";

async function createUsers() {
  const connection = await pool.getConnection();

  try {
    // Admin
    const adminPass = await bcrypt.hash("admin123", 10);
    await connection.execute(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@example.com", adminPass, 1]
    );

    // Developer
    const userPass = await bcrypt.hash("user123", 10);
    await connection.execute(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Developer", "user@example.com", userPass, 2]
    );

    // Viewer
    const viewerPass = await bcrypt.hash("viewer123", 10);
    await connection.execute(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Viewer", "viewer@example.com", viewerPass, 3]
    );

    console.log("Users created ✅");
  } catch (err) {
    console.error("Error creating users:", err);
  } finally {
    connection.release();
  }
}

createUsers();
