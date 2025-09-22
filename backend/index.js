import "./src/db/init.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js"; 





dotenv.config();
const app = express();

// app.use(cors());

app.use(cors({
  origin: "http://localhost:5173", // or your frontend URL/port
  credentials: true,
}));
app.use(express.json());
app.use("/auth", authRoutes);

app.get("/", (req, res) => res.send("Backend running 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
