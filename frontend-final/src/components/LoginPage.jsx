import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import our new useAuth hook
import { TextInput, PasswordInput, Button, Box, Title, Paper, Text } from '@mantine/core';

function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth(); // <-- 2. USE the new hook

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isTeacher = identifier.includes('@');
      const url = isTeacher
        ? 'http://localhost:5000/api/auth/teacher/login'
        : 'http://localhost:5000/api/auth/student/login';
      const payload = isTeacher
        ? { email: identifier, password: password }
        : { prn: identifier, password: password };
      const response = await axios.post(url, payload);
      login(response.data); 
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed. Please check your credentials.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box maw={400} mx="auto" mt={100}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} ta="center" mb="xl">
          Smart Attendance System
        </Title>
        <form onSubmit={handleLogin}>
          <TextInput
            label="Email (Teacher) or PRN (Student)"
            placeholder="Enter your email or PRN"
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            required
            mt="md"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          {error && <Text c="red" ta="center" mt="sm">{error}</Text>}
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Login
          </Button>
        </form>
        <Text c="dimmed" size="sm" ta="center" mt="md">
          Don't have an account yet?{' '}
          <Link to="/register" style={{textDecoration: 'none', color: '#1971c2', fontWeight: 500}}>
            Register here
          </Link>
        </Text>
      </Paper>
    </Box>
  );
}

export default LoginPage;