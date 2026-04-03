const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

const mongoUri = process.env.MONGO_URI;

// ─── Middleware ──────────────────────────────────────────────────────────────
// ✅ Fixed
app.use(cors({
  origin: ['http://localhost:3000', 'https://social-app-1-mg0m.onrender.com'],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded images statically (local fallback if no Cloudinary)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Social App API is running 🚀" });
});

// ─── Database Connection ─────────────────────────────────────────────────────
if (!mongoUri) {
  console.error("❌ MONGO_URI is missing. Add it to backend/.env before starting the server.");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
