import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  departments: [{ type: String, required: true }], // Changed to an array of strings
  subjects: [{ type: String }],
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export const Teacher = mongoose.model("Teacher", teacherSchema);