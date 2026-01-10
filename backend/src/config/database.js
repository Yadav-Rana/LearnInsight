const mongoose = require("mongoose");
const config = require("./index");

const connectDB = async () => {
  if (!config.mongodbUri) {
    console.error("Error: MONGODB_URI is not defined in environment variables");
    console.error("Please create a .env file in the backend folder with your MongoDB Atlas connection string");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
