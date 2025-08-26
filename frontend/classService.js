import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Function to get students who are not yet enrolled in a class
export const getUnenrolledStudents = (classId, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  return axios.get(`${API_BASE_URL}/students/unenrolled/${classId}`, config);
};

// We will add other functions here later (like enrolling students)