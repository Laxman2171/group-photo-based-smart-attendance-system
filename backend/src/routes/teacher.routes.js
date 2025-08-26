import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { ClassModel } from "../models/Class.js";

const router = Router();

// GET /api/teachers/dashboard-stats
// This route calculates and returns key stats for the teacher's dashboard.
router.get("/dashboard-stats", auth("teacher"), async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Find all classes taught by this teacher
    const classes = await ClassModel.find({ teacher: teacherId });

    // 2. The total number of classes is simply the length of the array
    const totalClasses = classes.length;

    // 3. To find unique students, we collect all student IDs from all classes
    let allStudentIds = [];
    classes.forEach(cls => {
      // We add the student IDs from each class to our master list
      allStudentIds.push(...cls.students);
    });
    
    // 4. A 'Set' is a special data structure that automatically removes duplicates.
    // This is a very efficient way to count unique students.
    const uniqueStudentIds = new Set(allStudentIds.map(id => id.toString()));
    const totalStudents = uniqueStudentIds.size;

    // 5. Send the final stats back as a JSON object
    res.json({
      totalClasses,
      totalStudents,
      // We can add more stats here in the future, like pending approvals
    });

  } catch (e) {
    console.error("Error fetching dashboard stats:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;