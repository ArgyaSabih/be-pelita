require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectDBConfig");
const PORT = 8000;
const app = express();

// Connect Database
connectDB();

// Create GET request
app.get("/", (req, res) => {
  res.send("PAW 15 Back-End");
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

// Route
// app.use("/user", require("./routes/UserRoutes"));

// Server run
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
