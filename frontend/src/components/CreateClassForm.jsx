import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// We accept a special function called 'onClassCreated' from the parent component.
// This function will allow us to tell the dashboard to refresh its class list.
function CreateClassForm({ onClassCreated }) {
  const { token } = useContext(AuthContext);

  // State for each input field in our form
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const classData = { name, subject, year, department };

      const response = await axios.post('http://localhost:5000/api/classes/create', classData, config);

      setSuccess(`Successfully created class: ${response.data.name}`);
      // Clear the form fields after success
      setName('');
      setSubject('');
      setYear('');
      setDepartment('');

      // This is the magic part: call the function passed from the parent dashboard!
      if (onClassCreated) {
        onClassCreated();
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
      <h3>Create a New Class</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Class Name (e.g., '4th Year Section B')" required />
        <br />
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required />
        <br />
        <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (e.g., '4th')" required />
        <br />
        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" required />
        <br />
        <button type="submit" style={{ marginTop: '10px' }}>Create Class</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default CreateClassForm;