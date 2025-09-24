// DB initialization
require("./src/config/init.js");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const { initTables } = require("./src/config/initTables");
const authRoutes = require("./src/routes/auth");
const folderRoutes = require("./src/routes/folderRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const fileRoutes = require("./src/routes/file"); // Make sure the file name matches

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initTables();
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", fileRoutes); // File upload route

// Test endpoint
app.get("/", (req, res) => res.send("Backend running 🚀"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
