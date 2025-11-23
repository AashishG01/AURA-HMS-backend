import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config(); // Load .env variables


const MONGO_URI = process.env.MONGO_URI;

//const MONGO_URI = "mongodb+srv://aashishg8160_db_user:1HW7qKFf4EXstAwe@cluster0.jb4brgk.mongodb.net/?appName=Cluster0"; // Local MongoDB

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;