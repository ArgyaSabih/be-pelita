require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require('passport');
require('./config/passport')(passport);
const connectDB = require("./config/connectDBConfig");
const PORT = 8000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
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
