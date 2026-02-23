import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// Import all route files
import authRoutes from "./routes/auth.routes.js";
import classRoutes from "./routes/class.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import reportRoutes from "./routes/report.routes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/reports", reportRoutes);

// A simple health check route
app.get("/", (_req, res) => res.send("Smart Attendance API is Alive!"));

const PORT = process.env.PORT || 5000;

// Start the server after connecting to the database
(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
})();