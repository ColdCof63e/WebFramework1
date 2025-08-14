/*
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const exphbs = require('express-handlebars');
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'public/views'));

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
************************************************************************************************************ */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const exphbs = require("express-handlebars");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "public/views"));

// MongoDB connection (execute once globally)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected successfully");
}
connectDB();

const restaurantRoutes = require("./routes/restaurantRoutes");
const Restaurant = require("./models/Restaurant");

// const port = process.env.PORT || 3000;

// Routes
app.use("/api/restaurants", restaurantRoutes);

// UI Routes
app.get("/", async (req, res) => {
  const restaurants = await Restaurant.find().lean();
  console.log("Rendering home page with restaurants:", restaurants);
  res.render("home", { restaurants });
});

app.get("/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    console.log("Rendering restaurant detail page for ID:", restaurant);
    res.render("detail", restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load restaurant details.");
  }
});

module.exports = app;