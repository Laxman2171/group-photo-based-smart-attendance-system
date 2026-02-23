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

    // Parse dates and set proper time ranges
    const startOfDay = new Date(fromDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);

    const classDoc = await ClassModel.findById(classId).populate('students', 'name prn');
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }

    if (!classDoc.students || classDoc.students.length === 0) {
      return res.status(404).json({ message: "No students enrolled in this class." });
    }

    const attendanceRecords = await Attendance.find({
      class: classId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: 1 });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found for the selected date range." });
    }

    // Build a map of attendance data per student
    // Structure: { studentId: { name, prn, dates: { "2026-02-20": "Present", "2026-02-21": "Absent" } } }
    const studentReportData = {};
    
    // Initialize all enrolled students with empty attendance
    classDoc.students.forEach(student => {
      studentReportData[student._id.toString()] = {
        name: student.name,
        prn: student.prn,
        dates: {}
      };
    });

    // Get unique dates from attendance records (formatted consistently)
    const uniqueDatesSet = new Set();
    attendanceRecords.forEach(record => {
      const dateStr = new Date(record.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      uniqueDatesSet.add(dateStr);
    });
    const uniqueDates = Array.from(uniqueDatesSet);

    // Process each attendance record
    attendanceRecords.forEach(attendanceDoc => {
      const dateStr = new Date(attendanceDoc.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      // For each student in the class, check their status in this record
      classDoc.students.forEach(student => {
        const studentId = student._id.toString();
        
        // Find this student's record in the attendance document
        const studentRecord = attendanceDoc.records.find(
          rec => rec.student.toString() === studentId
        );
        
        if (studentRecord) {
          // Student has a record for this date
          studentReportData[studentId].dates[dateStr] = studentRecord.status;
        } else {
          // Student was enrolled but not in the attendance record (treat as absent)
          if (!studentReportData[studentId].dates[dateStr]) {
            studentReportData[studentId].dates[dateStr] = 'Absent';
          }
        }
      });
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Smart Attendance System';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet(`${classDoc.name} Attendance`);

    // Build headers: PRN | Student Name | Date1 | Date2 | ... | Total Present | Total Absent | Attendance %
    const headers = ['PRN', 'Student Name', ...uniqueDates, 'Present', 'Absent', 'Attendance %'];
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Add data rows
    Object.keys(studentReportData).forEach(studentId => {
      const student = studentReportData[studentId];
      const row = [student.prn, student.name];
      
      let presentCount = 0;
      let absentCount = 0;
      
      uniqueDates.forEach(date => {
        const status = student.dates[date] || 'Absent';
        if (status === 'Present') {
          presentCount++;
          row.push('P');
        } else {
          absentCount++;
          row.push('A');
        }
      });
      
      // Add summary columns
      const totalClasses = uniqueDates.length;
      const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
      row.push(presentCount, absentCount, `${percentage}%`);
      
      const dataRow = worksheet.addRow(row);
      
      // Style the data cells
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Color code P and A cells
        if (colNumber > 2 && colNumber <= 2 + uniqueDates.length) {
          if (cell.value === 'P') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD4EDDA' } // Light green
            };
            cell.font = { color: { argb: 'FF155724' }, bold: true };
          } else if (cell.value === 'A') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8D7DA' } // Light red
            };
            cell.font = { color: { argb: 'FF721C24' }, bold: true };
          }
        }
        
        // Color code percentage based on attendance
        if (colNumber === headers.length) {
          const pct = parseInt(cell.value);
          if (pct >= 75) {
            cell.font = { color: { argb: 'FF155724' }, bold: true };
          } else if (pct >= 50) {
            cell.font = { color: { argb: 'FF856404' }, bold: true };
          } else {
            cell.font = { color: { argb: 'FF721C24' }, bold: true };
          }
        }
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        };
      });
    });

    // Auto-fit column widths
    worksheet.columns.forEach((column, index) => {
      if (index === 0) column.width = 15; // PRN
      else if (index === 1) column.width = 25; // Name
      else if (index < 2 + uniqueDates.length) column.width = 12; // Date columns
      else column.width = 12; // Summary columns
    });

    // Add summary row at the bottom
    worksheet.addRow([]); // Empty row
    const summaryRow = worksheet.addRow([
      'SUMMARY',
      `Total Students: ${Object.keys(studentReportData).length}`,
      `Total Sessions: ${uniqueDates.length}`,
      `Date Range: ${uniqueDates[0]} to ${uniqueDates[uniqueDates.length - 1]}`
    ]);
    summaryRow.font = { bold: true, italic: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Attendance-Report-${classDoc.name}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (e) {
    console.error("Error generating class summary report:", e);
    res.status(500).json({ message: "Server error while generating report." });
  }
});

export default router;