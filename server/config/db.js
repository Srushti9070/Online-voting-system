const mongoose = require('mongoose');

/**
 * Establishes an asynchronous connection to the MongoDB Database using Mongoose.
 * 
 * Read connection URI from process.env.MONGO_URI.
 * Logs success connection metrics or terminates process cleanly on critical failure.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`==================================================`);
    console.log(`🚀 MongoDB Connected Successfully!`);
    console.log(`📌 Database Host : ${conn.connection.host}`);
    console.log(`📌 Database Name : ${conn.connection.name}`);
    console.log(`==================================================`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit application with failure code (1) if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
