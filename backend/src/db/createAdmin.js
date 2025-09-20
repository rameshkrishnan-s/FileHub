import pool from "./db.js";
import bcrypt from "bcrypt";

async function createAdmin() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  // Admin
  await pool.query(
    "INSERT INTO users (name, email, password, role_id) VALUES ($1,$2,$3,$4)",
    ["Admin", "admin@example.com", passwordHash, 1]
  );

  // Normal User
  const userPass = await bcrypt.hash("user123", 10);
  await pool.query(
    "INSERT INTO users (name, email, password, role_id) VALUES ($1,$2,$3,$4)",
    ["User", "user@example.com", userPass, 2]
  );

  // Viewer
  const viewerPass = await bcrypt.hash("viewer123", 10);
  await pool.query(
    "INSERT INTO users (name, email, password, role_id) VALUES ($1,$2,$3,$4)",
    ["Viewer", "viewer@example.com", viewerPass, 3]
  );

  console.log("Admin, User, Viewer created ✅");
  pool.end();
}

createAdmin();
