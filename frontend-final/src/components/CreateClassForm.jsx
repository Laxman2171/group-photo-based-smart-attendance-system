import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import our new useAuth hook
import { TextInput, Button, Box, Text, Title, Select, Group } from '@mantine/core';

function CreateClassForm({ onClassCreated }) {
  const { token } = useAuth(); // <-- 2. Use the new hook

  // State for each input field in our form
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('1st');
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('1st');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const classData = { name, subject, year, department, semester };

      const response = await axios.post('http://localhost:5000/api/classes/create', classData, config);

      setSuccess(`Successfully created class: ${response.data.name}`);
      setName('');
      setSubject('');
      // We can leave year, dept, and sem as they are for the next entry

      if (onClassCreated) {
        onClassCreated();
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    }
  };

  return (
    <Box>
      <Title order={4}>Create a New Class</Title>
      <form onSubmit={handleSubmit} style={{marginTop: '15px'}}>
        <TextInput label="Class Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 'Section A'" required />
        <TextInput label="Subject" mt="md" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., 'Advanced AI'" required />
        <Group grow mt="md">
          <Select label="Department" data={['CSE', 'IT', 'ENTC', 'Civil', 'Mech']} value={department} onChange={setDepartment} />
          <Select label="Year" data={['1st', '2nd', '3rd', '4th']} value={year} onChange={setYear} />
        </Group>
        <Select mt="md" label="Semester" data={['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']} value={semester} onChange={setSemester} />

        <Button type="submit" mt="lg">Create Class</Button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
    </Box>
  );
}

export default CreateClassForm;