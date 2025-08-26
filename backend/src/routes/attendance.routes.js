import { Router } from "express";
import axios from "axios"; // We will use axios to make requests
import { auth } from "../middleware/auth.js";
import { ClassModel } from "../models/Class.js";
import { Attendance } from "../models/Attendance.js"; // Import the Attendance model

const router = Router();

// The URL where our Python AI service is running
const AI_SERVICE_URL = "http://localhost:5001/recognize";

// The main endpoint for marking attendance
router.post("/mark/:classId", auth("teacher"), async (req, res) => {
    try {
        const { classId } = req.params;
        const { groupPhotoUrl } = req.body;

        if (!groupPhotoUrl) {
            return res.status(400).json({ message: "Group photo URL is required." });
        }

        const classDoc = await ClassModel.findById(classId).populate('students');
        if (!classDoc) {
            return res.status(404).json({ message: "Class not found." });
        }

        // Prepare the data payload, just like before
        const student_data = classDoc.students
            .filter(student => student.photoUrls && student.photoUrls.length > 0) // Only include students with photos
            .map(student => ({
                id: student._id.toString(),
                photo_url: student.photoUrls[0] // Use the first photo for recognition
            }));

        const payloadForAI = {
            group_photo_url: groupPhotoUrl,
            student_data: student_data
        };

        // --- THIS IS THE NEW PART ---

        console.log("Sending data to AI Service...");
        // 1. Call the Python AI Service with our data
        const aiResponse = await axios.post(AI_SERVICE_URL, payloadForAI);
        const presentStudentIds = aiResponse.data.present_student_ids;
        console.log("Received list of present students from AI Service:", presentStudentIds);

        // 2. Create the full attendance record
        const attendanceRecords = classDoc.students.map(student => ({
            student: student._id,
            // Check if the student's ID is in the list we got back from the AI
            status: presentStudentIds.includes(student._id.toString()) ? "Present" : "Absent"
        }));

        // 3. Save the final record to the database
        const newAttendance = await Attendance.create({
            class: classId,
            date: new Date(),
            records: attendanceRecords
        });
        console.log("New attendance record saved to the database.");

        // 4. Send the final success response to the teacher
        res.status(201).json({ 
            message: "Attendance marked successfully!",
            attendance: newAttendance 
        });

    } catch (e) {
        console.error("Error in mark attendance route:", e.response ? e.response.data : e.message);
        res.status(500).json({ message: "Server error during attendance marking" });
    }
});

// GET ALL ATTENDANCE RECORDS FOR THE LOGGED-IN STUDENT
router.get("/student", auth("student"), async (req, res) => {
  try {
    // The student's ID comes from their login token
    const studentId = req.user.id;

    // Find all attendance documents where this student is present in the 'records' array
    // Then, populate the 'class' field with the class name and subject
    const allAttendanceDocs = await Attendance.find({ "records.student": studentId })
                                              .sort({ date: -1 }) // Sort by most recent date first
                                              .populate('class', 'name subject');

    if (!allAttendanceDocs) {
      return res.json([]); // Return an empty array if no records found
    }

    // The query above returns the full class records. Let's process them
    // to only return the data this specific student needs.
    const studentSpecificRecords = allAttendanceDocs.map(attendanceDoc => {
      const studentRecord = attendanceDoc.records.find(
        rec => rec.student.toString() === studentId
      );
      return {
        date: attendanceDoc.date,
        className: attendanceDoc.class.name,
        subject: attendanceDoc.class.subject,
        status: studentRecord.status,
        _id: attendanceDoc._id // A unique ID for the list key in React
      };
    });

    res.json(studentSpecificRecords);
  } catch (e) {
    console.error("Error fetching student attendance:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;