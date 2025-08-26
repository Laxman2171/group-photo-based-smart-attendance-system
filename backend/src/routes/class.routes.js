import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { ClassModel } from "../models/Class.js";
import { Student } from "../models/Student.js";
import { Teacher } from "../models/Teacher.js";

const router = Router();

// Route: CREATE A NEW CLASS (Teacher Only)
router.post("/create", auth("teacher"), async (req, res) => {
  try {
    const { name, subject, year, department } = req.body;
    if (!name || !subject || !year || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const classDoc = await ClassModel.create({
      name, subject, year, department, teacher: req.user.id,
    });
    await Teacher.findByIdAndUpdate(req.user.id, { $push: { classes: classDoc._id } });
    res.status(201).json(classDoc);
  } catch (e) {
    res.status(500).json({ message: "Server error while creating class" });
  }
});

// Route: ENROLL STUDENTS IN A CLASS (Teacher Only)
router.post("/:classId/enroll", auth("teacher"), async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentIds } = req.body;
        if (!studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ message: "studentIds must be an array" });
        }
        await ClassModel.findByIdAndUpdate(classId, {
            $addToSet: { students: { $each: studentIds } },
        });
        await Student.updateMany(
            { _id: { $in: studentIds } },
            { $addToSet: { classes: classId } }
        );
        res.json({ message: "Students enrolled successfully" });
    } catch (e) {
        res.status(500).json({ message: "Server error while enrolling students" });
    }
});

// Route: GET ALL CLASSES FOR THE LOGGED-IN TEACHER (Teacher Only)
router.get("/teacher", auth("teacher"), async (req, res) => {
  try {
    const classes = await ClassModel.find({ teacher: req.user.id });
    if (!classes) {
      return res.status(404).json({ message: "No classes found for this teacher." });
    }
    res.status(200).json(classes);
  } catch (e) {
    console.error("Error fetching teacher classes:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// Route: GET A SINGLE CLASS BY ITS ID (Teacher Only)
router.get("/:classId", auth("teacher"), async (req, res) => {
  try {
    const { classId } = req.params;
    // THE FIX: Changed 'roll' to 'prn' to match our new Student model
    const classDoc = await ClassModel.findById(classId).populate('students', 'name prn');
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }
    if (classDoc.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to view this class." });
    }
    res.status(200).json(classDoc);
  } catch (e) {
    console.error("Error fetching single class:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// Route: GET AVAILABLE CLASSES FOR A LOGGED-IN STUDENT (Student Only)
router.get("/available", auth("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }
    const availableClasses = await ClassModel.find({
      department: student.department,
      year: student.year,
      semester: student.semester,
    }).populate('teacher', 'name');
    res.json(availableClasses);
  } catch (e) {
    console.error("Error fetching available classes:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;