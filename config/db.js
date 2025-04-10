const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("اتصال موفق به MongoDB");
    })
    .catch((err) => {
      console.error("خطا در اتصال به MongoDB:", err);
    });
  } catch (err) {
    console.log(err)
  }
};



module.exports = {
  connectDB
}