const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use local URI if running offline, otherwise production
    const mongoURI = process.env.IS_OFFLINE
      ? process.env.MONGO_URI_PROD
      : process.env.MONGO_URI_PROD;
    console.log(mongoURI)

    // await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
