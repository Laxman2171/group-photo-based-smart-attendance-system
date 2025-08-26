import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { Student } from "../models/Student.js";
import { Teacher } from "../models/Teacher.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// --- STUDENT REGISTER ---
router.post("/student/register", upload.array("profilePhotos", 5), async (req, res) => {
    try {
      const { name, prn, department, year, email, semester, password } = req.body;
      const files = req.files;
      if (!name || !prn || !department || !year || !email || !semester || !password || !files || files.length === 0) {
        return res.status(400).json({ message: "All fields and at least one photo are required" });
      }
      if (!validator.isEmail(email)) { return res.status(400).json({ message: "Invalid email format" }); }
      const prnExists = await Student.findOne({ prn });
      if (prnExists) { return res.status(409).json({ message: "A student with this PRN already exists" });}
      const emailExists = await Student.findOne({ email });
      if (emailExists) { return res.status(409).json({ message: "A student with this email already exists" });}

      const uploadPromises = files.map(file => new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: "attendance-app-students" }, (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            });
          uploadStream.end(file.buffer);
        })
      );
      const photoUrls = await Promise.all(uploadPromises);
      const passwordHash = await bcrypt.hash(password, 10);
      const newStudent = await Student.create({ name, prn, department, year, email, semester, passwordHash, photoUrls });
      const token = signToken(newStudent._id, "student");
      // THE FIX: Include all the details in the user object
      res.status(201).json({ token, user: { id: newStudent._id, name, prn, role: "student", department, year, semester } });
    } catch (e) {
      console.error("Error during student registration:", e);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

// --- STUDENT LOGIN ---
router.post("/student/login", async (req, res) => {
    try {
        const { prn, password } = req.body;
        const student = await Student.findOne({ prn });
        if (!student) return res.status(404).json({ message: "Student not found" });
        const isMatch = await bcrypt.compare(password, student.passwordHash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
        const token = signToken(student._id, "student");
        // THE FIX: Include all the details in the user object
        res.json({ token, user: { id: student._id, name: student.name, prn: student.prn, role: "student", department: student.department, year: student.year, semester: student.semester } });
    } catch (e) {
        res.status(500).json({ message: "Server error during student login" });
    }
});

// --- TEACHER ROUTES (Unchanged) ---
router.post("/teacher/register", async (req, res) => {
  try {
      const { name, email, departments, password, subjects } = req.body; 
      if (!name || !email || !departments || !Array.isArray(departments) || departments.length === 0 || !password) {
          return res.status(400).json({ message: "Name, email, password, and at least one department are required" });
      }
      if (!validator.isEmail(email)) { return res.status(400).json({ message: "Invalid email" });}
      const teacherExists = await Teacher.findOne({ email });
      if (teacherExists) { return res.status(409).json({ message: "A teacher with this email already exists" });}
      const passwordHash = await bcrypt.hash(password, 10);
      const newTeacher = await Teacher.create({ name, email, departments, passwordHash, subjects: subjects || [], classes: [] });
      const token = signToken(newTeacher._id, "teacher");
      res.status(201).json({ token, user: { id: newTeacher._id, name, email, departments, role: "teacher" } });
  } catch (e) {
      console.error("Error during teacher registration:", e);
      res.status(500).json({ message: "Server error during teacher registration" });
  }
});
router.post("/teacher/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const teacher = await Teacher.findOne({ email });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });
        const isMatch = await bcrypt.compare(password, teacher.passwordHash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
        const token = signToken(teacher._id, "teacher");
        res.json({ token, user: { id: teacher._id, name: teacher.name, email: teacher.email, role: "teacher" } });
    } catch (e) {
        res.status(500).json({ message: "Server error during teacher login" });
    }
});

export default router;