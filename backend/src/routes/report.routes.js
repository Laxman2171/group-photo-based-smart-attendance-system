import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { Attendance } from "../models/Attendance.js";
import { ClassModel } from "../models/Class.js";
import ExcelJS from 'exceljs';

const router = Router();

router.post("/class-summary/:classId", auth("teacher"), async (req, res) => {
  try {
    const { classId } = req.params;
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "Please provide a 'fromDate' and 'toDate'." });
    }

    // --- FIX #1: CORRECT DATE RANGE HANDLING ---
    // Set the time to the very start of the fromDate
    const startOfDay = new Date(fromDate);
    startOfDay.setHours(0, 0, 0, 0);
    // Set the time to the very end of the toDate to make it inclusive
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);
    // ------------------------------------------

    const classDoc = await ClassModel.findById(classId).populate('students', 'name prn');
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }

    const attendanceRecords = await Attendance.find({
      class: classId,
      date: { $gte: startOfDay, $lte: endOfDay } // Use the corrected dates
    }).sort({ date: 1 });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found for the selected date range." });
    }

    // --- FIX #2: CORRECT DATA PROCESSING & AVERAGE CALCULATION ---
    const studentReportData = {};
    classDoc.students.forEach(student => {
      studentReportData[student._id.toString()] = {
        name: student.name,
        prn: student.prn,
        attendance: {}, // e.g. { "9/28/2025": "Present" }
      };
    });

    // Get a unique, sorted list of dates
    const uniqueDates = [...new Set(attendanceRecords.map(r => new Date(r.date).toLocaleDateString()))];

    // Populate the attendance status for each student on each unique date
    uniqueDates.forEach(dateString => {
      classDoc.students.forEach(student => {
        const studentId = student._id.toString();
        let finalStatus = "Absent"; // Default to absent
        // Find any record for this student on this day
        for (const record of attendanceRecords) {
          if (new Date(record.date).toLocaleDateString() === dateString) {
            const studentRecord = record.records.find(sr => sr.student.toString() === studentId);
            if (studentRecord && studentRecord.status === "Present") {
              finalStatus = "Present"; // If they are present in ANY record for that day, they are present.
              break;
            }
          }
        }
        studentReportData[studentId].attendance[dateString] = finalStatus;
      });
    });

    // ----------------------------------------------------------------

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${classDoc.name} Report`);

    const headers = ['PRN', 'Student Name', ...uniqueDates, 'Attendance %'];
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };

    for (const studentId in studentReportData) {
      const student = studentReportData[studentId];
      const row = [student.prn, student.name];

      let presentCount = 0;
      uniqueDates.forEach(date => {
        const status = student.attendance[date];
        if (status === 'Present') {
          presentCount++;
          row.push(1);
        } else {
          row.push(0);
        }
      });

      // Correctly calculate percentage based on unique days
      const percentage = uniqueDates.length > 0 ? Math.round((presentCount / uniqueDates.length) * 100) : 0;
      row.push(`${percentage}%`);

      worksheet.addRow(row);
    }

    worksheet.columns.forEach(column => { column.width = 15; });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Report-${classDoc.name}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (e) {
    console.error("Error generating class summary report:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;