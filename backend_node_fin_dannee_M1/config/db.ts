// src/config/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/etude_socket";
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
};

export default connectDB;
