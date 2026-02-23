import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { ClassModel } from "../models/Class.js";
import { Student } from "../models/Student.js";
import { Teacher } from "../models/Teacher.js";

const router = Router();

// --- THIS IS THE NEW, UPGRADED "CREATE CLASS" ROUTE ---
router.post("/create", auth("teacher"), async (req, res) => {
  try {
    const { name, subject, year, department, semester } = req.body;
    if (!name || !subject || !year || !department || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Find all students that match the new class's criteria
    const matchingStudents = await Student.find({ department, year, semester });
    const studentIdsToEnroll = matchingStudents.map(student => student._id);

    console.log(`Found ${studentIdsToEnroll.length} students to auto-enroll.`);

    // 2. Create the new class and immediately add the found students
    const classDoc = await ClassModel.create({
      name, 
      subject, 
      year, 
      department, 
      semester,
      teacher: req.user.id,
      students: studentIdsToEnroll // Auto-populate the students array
    });

    // 3. Update the teacher's record with the new class ID
    await Teacher.findByIdAndUpdate(req.user.id, { $push: { classes: classDoc._id } });

    // 4. Update all the enrolled students' records to add this new class
    if (studentIdsToEnroll.length > 0) {
      await Student.updateMany(
          { _id: { $in: studentIdsToEnroll } },
          { $addToSet: { classes: classDoc._id } }
      );
    }

    res.status(201).json(classDoc);
  } catch (e) {
    console.error("Error while creating class:", e);
    res.status(500).json({ message: "Server error while creating class" });
  }
});

// Route: MANUALLY ENROLL STUDENTS IN A CLASS (Teacher Only)
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


// DELETE A CLASS (Teacher Only, with Ownership Check)
router.delete("/:classId", auth("teacher"), async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    // 1. Find the class to ensure it exists and the teacher actually owns it
    const classToDelete = await ClassModel.findOne({ _id: classId, teacher: teacherId });

    if (!classToDelete) {
      return res.status(404).json({ message: "Class not found or you don't have permission to delete it." });
    }

    // 2. Delete the class itself
    await ClassModel.findByIdAndDelete(classId);

    // 3. Clean up references (this is the professional way to keep the database clean)
    // Remove the class from the teacher's 'classes' array
    await Teacher.findByIdAndUpdate(teacherId, { $pull: { classes: classId } });

    // Remove the class from all enrolled students' 'classes' array
    await Student.updateMany(
        { classes: classId },
        { $pull: { classes: classId } }
    );

    // Bonus: Delete all attendance records associated with this class
    await Attendance.deleteMany({ class: classId });

    res.status(200).json({ message: "Class and all associated data deleted successfully" });

  } catch (e) {
    console.error("Error deleting class:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;