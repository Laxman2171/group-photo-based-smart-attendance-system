import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  prn: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  semester: { type: String, required: true },

  // We still keep the URL for displaying the image in the UI
  profilePhotoUrl: { type: String }, 

  // --- THIS IS THE NEW, IMPORTANT FIELD ---
  faceEmbedding: {
    type: [Number], // Storing the "fingerprint" as an array of numbers
    required: true
  },
  // ----------------------------------------

  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export const Student = mongoose.model("Student", studentSchema);