import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { Student } from "../models/Student.js";
import { Teacher } from "../models/Teacher.js";
import { ClassModel } from "../models/Class.js";
import axios from "axios";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const AI_SERVICE_REPRESENT_URL = "http://localhost:5001/represent";

function signToken(id, role, otherData = {}) {
  return jwt.sign({ id, role, ...otherData }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// STUDENT REGISTER (with embedding generation)
router.post("/student/register", upload.single("profilePhoto"), async (req, res) => {
    try {
      const { name, prn, department, year, email, semester, password } = req.body;
      const file = req.file;
      if (!name || !prn || !password || !file) {
        return res.status(400).json({ message: "All fields and a photo are required" });
      }
      const prnExists = await Student.findOne({ prn });
      if (prnExists) { return res.status(409).json({ message: "A student with this PRN already exists" });}
      const emailExists = await Student.findOne({ email });
      if (emailExists) { return res.status(409).json({ message: "A student with this email already exists" });}

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "attendance-app-students" }, (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        });
        uploadStream.end(file.buffer);
      });
      const profilePhotoUrl = await uploadPromise;

      console.log("Calling AI service to generate face embedding...");
      const aiResponse = await axios.post(AI_SERVICE_REPRESENT_URL, { img_url: profilePhotoUrl });
      const faceEmbedding = aiResponse.data.embedding;
      if (!faceEmbedding || faceEmbedding.length === 0) {
        return res.status(400).json({ message: "Could not detect a clear face in the uploaded photo. Please use a different picture." });
      }
      console.log("Embedding generated successfully.");

      const passwordHash = await bcrypt.hash(password, 10);
      const newStudent = await Student.create({ name, prn, department, year, email, semester, passwordHash, profilePhotoUrl, faceEmbedding });

      // AUTO-ENROLL: Find all classes that match this student's department, year, semester
      const matchingClasses = await ClassModel.find({ department, year, semester });
      if (matchingClasses.length > 0) {
        const classIds = matchingClasses.map(c => c._id);
        // Add student to each matching class
        await ClassModel.updateMany(
          { _id: { $in: classIds } },
          { $addToSet: { students: newStudent._id } }
        );
        // Add classes to student's record
        await Student.findByIdAndUpdate(newStudent._id, {
          $addToSet: { classes: { $each: classIds } }
        });
        console.log(`✓ Auto-enrolled student ${prn} in ${matchingClasses.length} existing class(es)`);
      }

      const token = signToken(newStudent._id, "student", { prn, name, department, year, semester });
      res.status(201).json({ token, user: { id: newStudent._id, name, prn, role: "student", department, year, semester } });
    } catch (e) {
      console.error("Error during student registration:", e.response ? e.response.data : e.message);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

// STUDENT LOGIN (uses PRN)
router.post("/student/login", async (req, res) => {
    try {
        const { prn, password } = req.body;
        const student = await Student.findOne({ prn });
        if (!student) return res.status(404).json({ message: "Student not found" });
        const isMatch = await bcrypt.compare(password, student.passwordHash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
        const token = signToken(student._id, "student", { prn: student.prn, name: student.name, department: student.department, year: student.year, semester: student.semester });
        res.json({ token, user: { id: student._id, name: student.name, prn: student.prn, role: "student", department: student.department, year: student.year, semester: student.semester } });
    } catch (e) {
        res.status(500).json({ message: "Server error during student login" });
    }
});

// TEACHER REGISTER (uses multiple departments)
router.post("/teacher/register", async (req, res) => {
    try {
        const { name, email, departments, password } = req.body; 
        if (!name || !email || !departments || !Array.isArray(departments) || departments.length === 0 || !password) {
            return res.status(400).json({ message: "Name, email, password, and at least one department are required" });
        }
        if (!validator.isEmail(email)) { return res.status(400).json({ message: "Invalid email" });}
        const teacherExists = await Teacher.findOne({ email });
        if (teacherExists) { return res.status(409).json({ message: "A teacher with this email already exists" });}
        const passwordHash = await bcrypt.hash(password, 10);
        const newTeacher = await Teacher.create({ name, email, departments, passwordHash, classes: [] });
        const token = signToken(newTeacher._id, "teacher", { name, email });
        res.status(201).json({ token, user: { id: newTeacher._id, name, email, departments, role: "teacher" } });
    } catch (e) {
        console.error("Error during teacher registration:", e);
        res.status(500).json({ message: "Server error during teacher registration" });
    }
});

// TEACHER LOGIN
router.post("/teacher/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const teacher = await Teacher.findOne({ email });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });
        const isMatch = await bcrypt.compare(password, teacher.passwordHash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
        const token = signToken(teacher._id, "teacher", { name: teacher.name, email: teacher.email });
        res.json({ token, user: { id: teacher._id, name: teacher.name, email: teacher.email, role: "teacher" } });
    } catch (e) {
        res.status(500).json({ message: "Server error during teacher login" });
    }
});

export default router;