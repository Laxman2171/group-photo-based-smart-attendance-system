import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js"; // Our configured Cloudinary
import { auth } from "../middleware/auth.js"; // Our security guard

const router = Router();

// Configure Multer to store files in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage });

// The upload route
// It's protected by auth("teacher")
// And it uses multer to handle a single file upload from a form field named "groupPhoto"
router.post(
  "/group-photo",
  auth("teacher"),
  upload.single("groupPhoto"),
  async (req, res) => {
    try {
      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // Upload the file buffer to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "attendance-app-photos", // Optional: saves to a specific folder in Cloudinary
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ message: "Error uploading to Cloudinary." });
          }
          // Send the successful upload details back to the user
          res.status(200).json({
            message: "File uploaded successfully",
            url: result.secure_url,
          });
        }
      );

      // End the stream and send the file buffer
      uploadStream.end(req.file.buffer);

    } catch (e) {
      console.error("Server error during upload:", e);
      res.status(500).json({ message: "Server error during file upload." });
    }
  }
);

export default router;