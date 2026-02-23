import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import our new useAuth hook
import { TextInput, PasswordInput, Button, Box, Title, Paper, Text, FileInput, Select, Group, SegmentedControl, MultiSelect } from '@mantine/core';

function RegisterPage() {
    const [role, setRole] = useState('student'); 
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [prn, setPrn] = useState('');
    const [studentDepartment, setStudentDepartment] = useState('CSE');
    const [year, setYear] = useState('1st');
    const [studentEmail, setStudentEmail] = useState('');
    const [semester, setSemester] = useState('1st');
    const [photo, setPhoto] = useState(null);
    const [email, setEmail] = useState('');
    const [teacherDepartments, setTeacherDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); // <-- 2. USE the new hook

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            let response;
            if (role === 'student') {
                if (!photo) {
                    setError('Please upload a profile photo.');
                    setLoading(false);
                    return;
                }
                const formData = new FormData();
                formData.append('name', name);
                formData.append('prn', prn);
                formData.append('department', studentDepartment);
                formData.append('year', year);
                formData.append('email', studentEmail);
                formData.append('semester', semester);
                formData.append('password', password);
                formData.append('profilePhoto', photo);
                response = await axios.post('http://localhost:5000/api/auth/student/register', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                const payload = { name, email, departments: teacherDepartments, password };
                response = await axios.post('http://localhost:5000/api/auth/teacher/register', payload);
            }
            login(response.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maw={450} mx="auto" mt={50} mb={50}>
          <Paper withBorder shadow="md" p={30} radius="md">
            <Title order={2} ta="center">Create an Account</Title>
            <SegmentedControl fullWidth value={role} onChange={setRole} data={[{ label: 'I am a Student', value: 'student' },{ label: 'I am a Teacher', value: 'teacher' }]} mt="xl"/>
            <form onSubmit={handleSubmit} style={{marginTop: '20px'}}>
              <TextInput label="Full Name" placeholder="Enter your full name" required value={name} onChange={(event) => setName(event.currentTarget.value)} />
              {role === 'student' ? (
                <>
                  <TextInput label="PRN Number" placeholder="Enter your unique PRN" required mt="md" value={prn} onChange={(event) => setPrn(event.currentTarget.value)} />
                  <TextInput label="Email" type="email" placeholder="Enter your college email" required mt="md" value={studentEmail} onChange={(event) => setStudentEmail(event.currentTarget.value)} />
                  <Group grow mt="md">
                    <Select label="Department" data={['CSE', 'IT', 'ENTC', 'Civil', 'Mech']} value={studentDepartment} onChange={setStudentDepartment} />
                    <Select label="Year" data={['1st', '2nd', '3rd', '4th']} value={year} onChange={setYear} />
                  </Group>
                  <Select mt="md" label="Semester" data={['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']} value={semester} onChange={setSemester} />
                  <FileInput label="Profile Photo" placeholder="Upload one clear photo" required mt="md" value={photo} onChange={setPhoto} clearable/>
                </>
              ) : (
                <>
                  <TextInput label="Email" placeholder="Enter your email" required mt="md" value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
                  <MultiSelect label="Departments" placeholder="Select one or more" data={['CSE', 'IT', 'ENTC', 'Civil', 'Mech']} value={teacherDepartments} onChange={setTeacherDepartments} required mt="md"/>
                </>
              )}
              <PasswordInput label="Password" placeholder="Choose a password" required mt="md" value={password} onChange={(event) => setPassword(event.currentTarget.value)} />
              {error && <Text c="red" ta="center" mt="sm">{error}</Text>}
              <Button type="submit" fullWidth mt="xl" loading={loading}>Register</Button>
            </form>
            <Text c="dimmed" size="sm" ta="center" mt="md">
                Already have an account? <Link to="/login" style={{textDecoration: 'none', color: '#1971c2', fontWeight: 500}}>Login here</Link>
            </Text>
          </Paper>
        </Box>
    );
}

export default RegisterPage;