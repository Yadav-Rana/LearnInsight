const mongoose = require("mongoose");
const config = require("./index");

let connecting = null;

// Idempotent: app.js (serverless entry) and server.js may both call this.
const connectDB = () => {
  if (connecting) return connecting;

  if (!config.mongodbUri) {
    console.error("Error: MONGODB_URI is not defined in environment variables");
    console.error("Please create a .env file in the backend folder with your MongoDB Atlas connection string");
    process.exit(1);
  }

  connecting = mongoose
    .connect(config.mongodbUri)
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });
  return connecting;
};

module.exports = connectDB;
