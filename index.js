require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("./config/passport")(passport);
const connectDB = require("./config/connectDBConfig");
const PORT = process.env.PORT || 8000;
const app = express();

// Configure CORS to support multiple origins
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Body parser
app.use(express.json());

app.use(passport.initialize());

// Connect Database
connectDB();

// Create GET request
app.get("/", (req, res) => {
  res.send("PAW 15 Back-End");
});

// Routes
app.use("/api/schedules", require("./routes/ScheduleRoutes"));
app.use("/api/users", require("./routes/UserRoutes"));
app.use("/api/announcements", require("./routes/AnnouncementRoutes"));
app.use("/api/feedbacks", require("./routes/FeedbackRoutes"));
app.use("/api/permission-letters", require("./routes/PermissionLetterRoutes"));
app.use("/api/children", require("./routes/ChildRoutes"));
app.use("/api/auth", require("./routes/AuthRoutes"));

// Server run
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
