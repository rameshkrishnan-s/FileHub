import express from "express";
import pool from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) return res.status(400).json({ error: "User not found" });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign(
    { id: user.id, role: user.role_id, name: user.name },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "1h" }
  );

  res.json({ token, role: user.role_id, name: user.name });
});

export default router;
