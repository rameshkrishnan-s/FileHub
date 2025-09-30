const express = require("express");
const mysql = require("mysql2/promise");
const authMiddleware = require("../middleware/authMiddleware");

const db = require("../models");

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


// 📌 Get tasks and file permissions by user_id
router.get("/my-tasks/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { status } = req.query;

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

    // ✅ Get tasks for this user with status filter
    let taskQuery = "SELECT id, task, file_or_folder_name, message, status, created_at FROM tasks WHERE user_id = ?";
    let taskParams = [user_id];
    
    if (status) {
      taskQuery += " AND status = ?";
      taskParams.push(status);
    }

    const [tasks] = await conn.execute(taskQuery, taskParams);

    // ✅ Get file/folder permissions from Sequelize
    const userFiles = await db.UserFile.findAll({ where: { user_id } });

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

// Update task status
router.put("/update-task-status/:task_id", async (req, res) => {
  const { task_id } = req.params;
  const { status } = req.body;

  if (!task_id || !status) {
    return res.status(400).json({ message: "Task ID and status are required!" });
  }

  if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
    return res.status(400).json({ message: "Invalid status!" });
  }

  const conn = await pool.getConnection();
  try {
    // Check if task exists and belongs to user (assuming auth middleware provides user_id)
    const [task] = await conn.execute("SELECT * FROM tasks WHERE id = ?", [task_id]);
    if (task.length === 0) {
      return res.status(404).json({ message: "Task not found!" });
    }

    await conn.execute("UPDATE tasks SET status = ? WHERE id = ?", [status, task_id]);

    // If task is accepted, grant write permission to the folder
    if (status === 'accepted' && task[0].file_or_folder_name) {
      // Fetch user name
      const [user] = await conn.execute("SELECT name FROM users WHERE id = ?", [task[0].user_id]);
      const userName = user.length > 0 ? user[0].name : 'Unknown';

      await db.UserFile.upsert({
        user_id: task[0].user_id,
        user_name: userName,
        file_or_folder: task[0].file_or_folder_name,
        permission: 'write'
      });
    }

    res.json({ message: "Task status updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error updating task status.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Get files by folder (assuming folder is extraCode)
router.get("/files/folder/:folderName", async (req, res) => {
  const { folderName } = req.params;
  const conn = await pool.getConnection();
  try {
    const [files] = await conn.execute("SELECT * FROM files WHERE extraCode = ?", [folderName]);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: "Error fetching files.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// 📌 Get all tasks for admin
router.get("/all-tasks", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [tasks] = await conn.execute(`
      SELECT t.id, t.task, t.file_or_folder_name, t.message, t.status, t.created_at, 
             u.name as user_name, u.email, r.name as role
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      ORDER BY t.created_at DESC
    `);

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: "Error fetching all tasks.", error: err.toString() });
  } finally {
    conn.release();
  }
});

// Export CommonJS
module.exports = router;
