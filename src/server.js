const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // change if needed
  password: "password", // your MySQL password
  database: "DocumentDB"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL connected to DocumentDB...");
});

// Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length === 0) return res.status(400).json({ error: "User not found" });

    const user = result[0];

    // ⚠️ Plain text check for demo (use bcrypt in production)
    if (password !== user.password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      "secret123",
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
