import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import our new useAuth hook
import { FileInput, Button, Box, Text } from '@mantine/core';

function MarkAttendanceForm({ classId }) {
  const { token } = useAuth(); // <-- 2. USE the new hook

  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a photo to upload.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Upload the photo to Cloudinary
      const formData = new FormData();
      formData.append('groupPhoto', selectedFile);
      const uploadConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      const uploadResponse = await axios.post('http://localhost:5000/api/upload/group-photo', formData, uploadConfig);
      const groupPhotoUrl = uploadResponse.data.url;

      // Step 2: Call the mark attendance endpoint with the new URL
      const markAttendanceConfig = { headers: { Authorization: `Bearer ${token}` } };
      const body = { groupPhotoUrl: groupPhotoUrl };
      const markResponse = await axios.post(`http://localhost:5000/api/attendance/mark/${classId}`, body, markAttendanceConfig);

      const records = markResponse.data.attendance.records;
      const presentStudents = records.filter(record => record.status === 'Present');
      const presentStudentNames = presentStudents.map(record => record.student.name);

      if (presentStudentNames.length > 0) {
        setSuccess(`Attendance Marked! Found: ${presentStudentNames.join(', ')}`);
      } else {
        setSuccess('Attendance Marked! No students were found present.');
      }

    } catch (err) {
      console.error("Failed to mark attendance:", err);
      setError(err.response?.data?.message || 'An error occurred during the process.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box mt="xl" style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
      <Text size="lg" fw={700}>Mark Today's Attendance</Text>
      <form onSubmit={handleSubmit}>
        <FileInput
          label="Upload Group Photo"
          placeholder="Choose today's class photo"
          required
          mt="md"
          onChange={setSelectedFile}
          clearable
        />
        <Button type="submit" mt="md" loading={isLoading}>
          Take Attendance
        </Button>
      </form>
      {error && <Text c="red" mt="sm">{error}</Text>}
      {success && <Text c="green" mt="sm">{success}</Text>}
    </Box>
  );
}

export default MarkAttendanceForm;