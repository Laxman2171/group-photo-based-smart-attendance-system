import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Checkbox, Button, Box, Text, Loader, Stack, Group } from '@mantine/core';

// This component receives the classId and a refresh function from its parent page
function EnrollStudentForm({ classId, onStudentEnrolled }) {
  const { token } = useContext(AuthContext);

  const [unenrolledStudents, setUnenrolledStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUnenrolled = async () => {
    if (!token || !classId) return;
    try {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5000/api/students/unenrolled/${classId}`, config);
      setUnenrolledStudents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load available students.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run the fetch function once when the component first loads
  useEffect(() => {
    fetchUnenrolled();
  }, [classId, token]);

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents(prevSelected =>
      prevSelected.includes(studentId)
        ? prevSelected.filter(id => id !== studentId) // Unselect
        : [...prevSelected, studentId] // Select
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedStudents.length === 0) {
      setError('Please select at least one student to enroll.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const body = { studentIds: selectedStudents };
      await axios.post(`http://localhost:5000/api/classes/${classId}/enroll`, body, config);

      setSuccess('Students enrolled successfully!');
      setSelectedStudents([]); // Clear the selection
      fetchUnenrolled(); // Refresh the list of unenrolled students
      onStudentEnrolled(); // IMPORTANT: Tell the parent page to refresh its own list!
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll students.');
    }
  };

  if (isLoading) return <Loader mt="md" />;

  return (
    <Box mt="xl">
      <Text size="lg" fw={500}>Enroll New Students</Text>
      {unenrolledStudents.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <Stack mt="md">
            {unenrolledStudents.map(student => (
              <Checkbox
                key={student._id}
                label={`${student.name} (Roll: ${student.roll})`}
                checked={selectedStudents.includes(student._id)}
                onChange={() => handleCheckboxChange(student._id)}
              />
            ))}
          </Stack>
          <Button type="submit" mt="md">Enroll Selected Students</Button>
        </form>
      ) : (
        <Text mt="md" c="dimmed">No new students available to enroll in this class.</Text>
      )}
      {error && <Text c="red" mt="sm">{error}</Text>}
      {success && <Text c="green" mt="sm">{success}</Text>}
    </Box>
  );
}

export default EnrollStudentForm;