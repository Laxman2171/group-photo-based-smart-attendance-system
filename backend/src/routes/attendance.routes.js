import { Router } from "express";
import axios from "axios";
import { auth } from "../middleware/auth.js";
import { ClassModel } from "../models/Class.js";
import { Attendance } from "../models/Attendance.js";
import { Student } from "../models/Student.js";

const router = Router();
const AI_SERVICE_URL = "http://localhost:5001/recognize";

// POST route to mark attendance
router.post("/mark/:classId", auth("teacher"), async (req, res) => {
    // ... (This function is complete and correct from our last session)
    try {
        const { classId } = req.params;
        const { groupPhotoUrl } = req.body; 
        if (!groupPhotoUrl) return res.status(400).json({ message: "Group photo URL is required." });
        const classDoc = await ClassModel.findById(classId).populate('students');
        if (!classDoc) return res.status(404).json({ message: "Class not found." });
        const student_embeddings_data = classDoc.students
            .filter(student => student.faceEmbedding && student.faceEmbedding.length > 0)
            .map(student => ({ id: student._id.toString(), embedding: student.faceEmbedding }));
        const payloadForAI = { group_photo_url: groupPhotoUrl, student_embeddings_data: student_embeddings_data };
        let presentStudentIds = [];
        if (student_embeddings_data.length > 0) {
            const aiResponse = await axios.post(AI_SERVICE_URL, payloadForAI);
            presentStudentIds = aiResponse.data.present_student_ids;
        }
        const attendanceRecords = classDoc.students.map(student => ({
            student: student._id,
            status: presentStudentIds.includes(student._id.toString()) ? "Present" : "Absent"
        }));
        const newAttendance = await Attendance.create({ class: classId, date: new Date(), records: attendanceRecords });
        const populatedAttendance = await Attendance.findById(newAttendance._id).populate({ path: 'records.student', select: 'name prn' });
        res.status(201).json({ message: "Attendance marked successfully!", attendance: populatedAttendance });
    } catch (e) {
        console.error("Error in mark attendance route:", e.response ? e.response.data : e.message);
        res.status(500).json({ message: "Server error during attendance marking" });
    }
});

// GET route for a student to see their own attendance
router.get("/student", auth("student"), async (req, res) => {
    // ... (This function is complete and correct from our last session)
    try {
        const studentId = req.user.id;
        const allAttendanceDocs = await Attendance.find({ "records.student": studentId }).sort({ date: -1 }).populate('class', 'name subject');
        if (!allAttendanceDocs) return res.json([]);
        const studentSpecificRecords = allAttendanceDocs.map(attendanceDoc => {
          const studentRecord = attendanceDoc.records.find(rec => rec.student.toString() === studentId);
          return {
            date: attendanceDoc.date,
            className: attendanceDoc.class.name,
            subject: attendanceDoc.class.subject,
            status: studentRecord.status,
            _id: attendanceDoc._id
          };
        });
        res.json(studentSpecificRecords);
      } catch (e) {
        console.error("Error fetching student attendance:", e);
        res.status(500).json({ message: "Server error" });
      }
});

// --- THIS IS THE MISSING ROUTE ---
// GET ALL ATTENDANCE RECORDS FOR A SPECIFIC CLASS (Teacher Only)
router.get("/class/:classId", auth("teacher"), async (req, res) => {
  try {
    const { classId } = req.params;
    const attendanceHistory = await Attendance.find({ class: classId }).sort({ date: -1 });
    res.json(attendanceHistory);
  } catch (e) {
    console.error("Error fetching attendance history:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;