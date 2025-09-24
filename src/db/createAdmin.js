import pool from "./db.js";
import bcrypt from "bcrypt";

async function createAdmin() {
  const connection = await pool.getConnection();

  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await connection.execute(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@example.com", passwordHash, 1]
    );

    const userPass = await bcrypt.hash("user123", 10);
    await connection.execute(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["User", "user@example.com", userPass, 2]
    );

    const viewerPass = await bcrypt.hash("viewer123", 10);
    await connection.execute(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      ["Viewer", "viewer@example.com", viewerPass, 3]
    );

    console.log("Admin, User, Viewer created ✅");
  } finally {
    connection.release();
  }
}

createAdmin();
