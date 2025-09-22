import jwt from "jsonwebtoken";
import express from "express";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Example: simple role mapping (replace with DB check)
  let role = 3; // viewer by default
  if (email === "admin@test.com" && password === "1234") role = 1;
  else if (email === "dev@test.com" && password === "1234") role = 2;

  // If login fails
  if (!role) return res.status(401).json({ error: "Invalid credentials" });

  // Payload that will be inside the token
  const userPayload = { email, role };

  // Create JWT
  const token = jwt.sign(userPayload, process.env.JWT_SECRET || "supersecret", {
    expiresIn: "1h",
  });

  res.json({ token, role, name: email.split("@")[0] });
});

export default router;
