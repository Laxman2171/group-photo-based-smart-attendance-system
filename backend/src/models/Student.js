import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  // This is the only unique identifier we should have (besides the email)
  prn: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  semester: { type: String, required: true },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  photoUrls: [{ type: String }],
  embeddings: [{ type: [Number] }],
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export const Student = mongoose.model("Student", studentSchema);