require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectDBConfig");
const PORT = 8000;
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create GET request
app.get("/", (req, res) => {
  res.send("PAW 15 Back-End");
});

// Announcement Route
app.use("/api/announcements", require("./routes/AnnouncementRoutes"));

// User Route
// app.use("/user", require("./routes/UserRoutes"));

// Server run
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
