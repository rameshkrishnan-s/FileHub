// app.js
const express = require("express");
const cors = require("cors");


const { initTables } = require("./src/config/initTables");
const authRoutes = require("./src/routes/auth");
const folderRoutes = require("./src/routes/folderRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const fileRoutes = require("./src/routes/file");
const combinedRoutes = require("./src/routes/combined");


// Initialize tables
initTables();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/combined", combinedRoutes);

// Test endpoint
app.get("/", (req, res) => res.send("Backend running 🚀"));


module.exports = app;
