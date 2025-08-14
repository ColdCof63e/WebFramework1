const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB connection (execute once globally)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected successfully");
}
connectDB();

// Import and use your routes (adjust paths as needed)
const restaurantRoutes = require("./routes/restaurantRoutes");

app.use("/restaurants", restaurantRoutes);

// Default route for health check
app.get("/", (req, res) => res.json({ message: "API working!" }));

module.exports = app;