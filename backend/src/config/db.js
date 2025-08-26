import mongoose from "mongoose";

export async function connectDB() {
  try {
    // This line uses the MONGO_URI from your .env file
    await mongoose.connect(process.env.MONGO_URI, { dbName: "smart_attendance" });
    console.log("✅ MongoDB connected successfully.");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit the process with failure
  }
}