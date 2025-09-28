const express = require("express");
const mysql = require("mysql2/promise");

const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ------------------ COMPANY ROUTES ------------------ //

// Add company
router.post("/add-company", async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ message: "Code and name are required!" });

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.execute("SELECT * FROM companies WHERE code = ?", [code]);
    if (existing.length > 0) return res.status(400).json({ message: "Company code already exists!" });

    await conn.execute("INSERT INTO companies (code, name) VALUES (?, ?)", [code, name]);
    res.json({ message: "Company added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error adding company.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Edit company
router.post("/edit-company", async (req, res) => {
  const { oldCode, newCode, newName } = req.body;
  if (!oldCode || !newCode || !newName)
    return res.status(400).json({ message: "Old code, new code, and new name are required!" });

  const conn = await pool.getConnection();
  try {
    const [existingCompany] = await conn.execute("SELECT * FROM companies WHERE code = ?", [oldCode]);
    if (existingCompany.length === 0) return res.status(404).json({ message: "Company not found!" });

    if (oldCode !== newCode) {
      const [conflict] = await conn.execute("SELECT * FROM companies WHERE code = ?", [newCode]);
      if (conflict.length > 0) return res.status(400).json({ message: "New company code already exists!" });
    }

    await conn.execute("UPDATE companies SET code = ?, name = ? WHERE code = ?", [newCode, newName, oldCode]);
    res.json({ message: "Company updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error editing company.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Delete company
router.post("/delete-company", async (req, res) => {
  const { code } = req.body;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute("DELETE FROM companies WHERE code = ?", [code]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Company not found!" });
    res.json({ message: "Company deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting company.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Get all company codes
router.get("/company-codes", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [companies] = await conn.execute("SELECT code, name FROM companies");
    res.json({ total: companies.length, codes: companies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching company codes.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// ------------------ ASSEMBLY ROUTES ------------------ //

// Add assembly
router.post("/add-assembly", async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ message: "Code and name are required!" });

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.execute("SELECT * FROM assemblies WHERE code = ?", [code]);
    if (existing.length > 0) return res.status(400).json({ message: "Assembly code already exists!" });

    await conn.execute("INSERT INTO assemblies (code, name) VALUES (?, ?)", [code, name]);
    res.json({ message: "Assembly added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error adding assembly.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Edit assembly
router.post("/edit-assembly", async (req, res) => {
  const { oldCode, newCode, newName } = req.body;
  if (!oldCode || !newCode || !newName)
    return res.status(400).json({ message: "Old code, new code, and new name are required!" });

  const conn = await pool.getConnection();
  try {
    const [existingAssembly] = await conn.execute("SELECT * FROM assemblies WHERE code = ?", [oldCode]);
    if (existingAssembly.length === 0) return res.status(404).json({ message: "Assembly not found!" });

    if (oldCode !== newCode) {
      const [conflict] = await conn.execute("SELECT * FROM assemblies WHERE code = ?", [newCode]);
      if (conflict.length > 0) return res.status(400).json({ message: "New assembly code already exists!" });
    }

    await conn.execute("UPDATE assemblies SET code = ?, name = ? WHERE code = ?", [newCode, newName, oldCode]);
    res.json({ message: "Assembly updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error editing assembly.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Delete assembly
router.post("/delete-assembly", async (req, res) => {
  const { code } = req.body;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute("DELETE FROM assemblies WHERE code = ?", [code]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Assembly not found!" });
    res.json({ message: "Assembly deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting assembly.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Get all assembly codes
router.get("/assembly-codes", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [assemblies] = await conn.execute("SELECT code, name FROM assemblies");
    res.json({ total: assemblies.length, codes: assemblies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching assembly codes.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// ------------------ METADATA ------------------ //

router.get("/get-metadata", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [companies] = await conn.execute("SELECT * FROM companies");
    const [assemblies] = await conn.execute("SELECT * FROM assemblies");
    res.json({ companies, assemblies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching metadata.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// ------------------ USER ROUTES ------------------ //

// Add user
router.post("/add-user", async (req, res) => {
  const { name, email, password, role_id, position } = req.body;

  if (!name || !email || !password || !role_id) {
    return res.status(400).json({ message: "Name, email, password, and role are required!" });
  }

  const conn = await pool.getConnection();
  try {
    // Check if email already exists
    const [existing] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User with this email already exists!" });
    }

    // Hash password
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await conn.execute(
      "INSERT INTO users (name, email, password, role_id, position) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role_id, position || null]
    );

    res.json({ message: "User created successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error creating user.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Get all users
router.get("/users", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [users] = await conn.execute(
      `SELECT u.id, u.name, u.email, u.position, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id`
    );
    res.json({ total: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Get user details by ID or email
router.get("/profile", async (req, res) => {
  const { id, email } = req.query;

  if (!id && !email) {
    return res.status(400).json({ message: "Please provide user id or email!" });
  }

  const conn = await pool.getConnection();
  try {
    let query = "SELECT u.id, u.name, u.email, u.position, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE ";
    let params = [];

    if (id) {
      query += "u.id = ?";
      params.push(id);
    } else if (email) {
      query += "u.email = ?";
      params.push(email);
    }

    const [users] = await conn.execute(query, params);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// ------------------ TASK ROUTES ------------------ //

// Allocate task to a user
router.post("/allocate-task", async (req, res) => {
  const { user_id, task, file_or_folder_name, message, permission } = req.body;

  if (!user_id || !task) {
    return res.status(400).json({ message: "User ID and task are required!" });
  }

  const conn = await pool.getConnection();
  try {
    // ✅ Check if user exists
    const [user] = await conn.execute("SELECT id, name FROM users WHERE id = ?", [user_id]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    const userName = user[0].name;

    // ✅ Insert task
    await conn.execute(
      "INSERT INTO tasks (user_id, task, file_or_folder_name, message) VALUES (?, ?, ?, ?)",
      [user_id, task, file_or_folder_name || null, message || null]
    );

    // ✅ Update UserFile table using Sequelize
    const { UserFile } = require("../models"); // adjust path
    await UserFile.upsert({
      user_id,
      user_name: userName,
      file_or_folder: file_or_folder_name || "N/A",
      permission: permission || "read", // default to "read"
    });

    res.json({ message: "Task allocated successfully and user file updated!" });
  } catch (err) {
    res.status(500).json({ message: "Error allocating task.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// 📌 Get tasks and file permissions by user_id
router.get("/my-tasks/:user_id", async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required!" });
  }

  const conn = await pool.getConnection();
  try {
    // ✅ Check if user exists
    const [user] = await conn.execute("SELECT id, name FROM users WHERE id = ?", [user_id]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Get tasks for this user
    const [tasks] = await conn.execute(
      "SELECT id, task, file_or_folder_name, message, created_at FROM tasks WHERE user_id = ?",
      [user_id]
    );

    // ✅ Get file/folder permissions from Sequelize
    const { UserFile } = require("../models"); // adjust path
    const userFiles = await UserFile.findAll({ where: { user_id } });

    res.json({
      user: user[0],
      tasks,
      permissions: userFiles,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Export CommonJS
module.exports = router;
