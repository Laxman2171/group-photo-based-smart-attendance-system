import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { auth } from "../middleware/auth.js";
import { Student } from "../models/Student.js"; // We need the Student model
import { ClassModel } from "../models/Class.js";
const router = Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define the route for a student to upload their own photo
router.post(
  "/upload-photo",
  auth("student"), // This route is protected and only for students
  upload.single("profilePhoto"), // Expecting a file in a field named "profilePhoto"
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // The ID of the logged-in student is in req.user.id from our auth middleware
      const studentId = req.user.id;

      // Upload the file to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "attendance-app-students", // A different folder for student photos
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ message: "Error uploading to Cloudinary." });
          }

          // THIS IS THE NEW PART: Save the URL to the student's record in the database
          await Student.findByIdAndUpdate(studentId, {
            $push: { photoUrls: result.secure_url }, // Add the new URL to the photoUrls array
          });

          res.status(200).json({
            message: "Profile photo uploaded successfully",
            url: result.secure_url,
          });
        }
      );

      uploadStream.end(req.file.buffer);

    } catch (e) {
      console.error("Server error during student photo upload:", e);
      res.status(500).json({ message: "Server error during file upload." });
    }
  }
);
// GET STUDENTS AVAILABLE FOR ENROLLMENT IN A SPECIFIC CLASS
router.get("/unenrolled/:classId", auth("teacher"), async (req, res) => {
  try {
    const { classId } = req.params;

    // First, find the class to get its department and year
    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Next, find all students who are in the same department and year
    const potentialStudents = await Student.find({
      department: classDoc.department,
      year: classDoc.year,
    });

    // Figure out which students are already enrolled
    const enrolledStudentIds = new Set(classDoc.students.map(id => id.toString()));

    // Filter the list to find only students who are NOT already enrolled
    const unenrolledStudents = potentialStudents.filter(
      student => !enrolledStudentIds.has(student._id.toString())
    );

    res.json(unenrolledStudents);
  } catch (e) {
    console.error("Error fetching unenrolled students:", e);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;