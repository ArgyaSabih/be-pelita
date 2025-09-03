require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Terhubung ke MongoDB!");
    })
    .catch((error) => {
      console.error("Kesalahan koneksi:", error);
    });
};

module.exports = connectDB;
