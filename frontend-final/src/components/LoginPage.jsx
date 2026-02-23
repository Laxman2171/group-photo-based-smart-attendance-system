import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TextInput, PasswordInput, Button, Box, Title, Paper, Text, 
  Group, ThemeIcon, Stack, Divider, Center, rem, Flex
} from '@mantine/core';
import { 
  IconCamera, IconUsers, IconSchool, IconLock, IconMail, 
  IconId, IconSparkles, IconArrowRight, IconCheck
} from '@tabler/icons-react';

// ============================================================================
// OLD LOGIN PAGE CODE (COMMENTED OUT)
// ============================================================================
/*
function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

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
*/
// ============================================================================
// NEW MODERN LOGIN PAGE
// ============================================================================

const gradientBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

// Feature item component
function FeatureItem({ icon: Icon, title, description }) {
  return (
    <Group gap="md" align="flex-start">
      <ThemeIcon size={40} radius="xl" variant="light" color="white" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <Icon size={20} color="white" />
      </ThemeIcon>
      <Box>
        <Text fw={600} c="white">{title}</Text>
        <Text size="sm" style={{ opacity: 0.8 }} c="white">{description}</Text>
      </Box>
    </Group>
  );
}

function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

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
    <Box style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Branding */}
      <Box
        style={{
          flex: 1,
          background: gradientBg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: rem(60),
          position: 'relative',
          overflow: 'hidden',
        }}
        visibleFrom="md"
      >
        {/* Decorative circles */}
        <Box
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />

        <Box style={{ position: 'relative', zIndex: 1 }}>
          <Group gap="sm" mb={rem(40)}>
            <ThemeIcon size={50} radius="xl" variant="white" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <IconCamera size={28} color="white" />
            </ThemeIcon>
            <Title order={2} c="white">Smart Attendance</Title>
          </Group>

          <Title order={1} c="white" mb="lg" style={{ fontSize: rem(42), lineHeight: 1.2 }}>
            AI-Powered Attendance Made Simple
          </Title>
          
          <Text size="lg" c="white" style={{ opacity: 0.9 }} mb={rem(40)}>
            Mark attendance automatically using facial recognition. Just upload a group photo!
          </Text>

          <Stack gap="xl">
            <FeatureItem 
              icon={IconCamera}
              title="Face Recognition"
              description="Automatically detect and identify students from photos"
            />
            <FeatureItem 
              icon={IconSparkles}
              title="AI Powered"
              description="Using DeepFace for accurate face matching"
            />
            <FeatureItem 
              icon={IconUsers}
              title="Easy Management"
              description="Manage classes, students, and reports effortlessly"
            />
          </Stack>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: rem(40),
          background: 'var(--mantine-color-gray-0)',
        }}
      >
        <Box style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile Logo */}
          <Center mb="xl" hiddenFrom="md">
            <Group gap="sm">
              <ThemeIcon size={45} radius="xl" style={{ background: gradientBg }}>
                <IconCamera size={24} color="white" />
              </ThemeIcon>
              <Title order={3}>Smart Attendance</Title>
            </Group>
          </Center>

          <Paper withBorder shadow="xl" p={rem(40)} radius="lg">
            <Title order={2} ta="center" mb={rem(8)}>
              Welcome Back!
            </Title>
            <Text c="dimmed" ta="center" mb="xl">
              Sign in to continue to your dashboard
            </Text>

            <form onSubmit={handleLogin}>
              <TextInput
                label="Email or PRN"
                placeholder="teacher@email.com or student PRN"
                required
                size="md"
                radius="md"
                leftSection={<IconMail size={18} />}
                value={identifier}
                onChange={(event) => setIdentifier(event.currentTarget.value)}
              />
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                required
                mt="lg"
                size="md"
                radius="md"
                leftSection={<IconLock size={18} />}
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
              />

              {error && (
                <Paper withBorder p="sm" mt="md" radius="md" style={{ borderColor: 'var(--mantine-color-red-4)', background: 'var(--mantine-color-red-0)' }}>
                  <Text c="red" size="sm" ta="center">{error}</Text>
                </Paper>
              )}

              <Button 
                type="submit" 
                fullWidth 
                mt="xl" 
                size="lg"
                radius="md"
                loading={loading}
                rightSection={!loading && <IconArrowRight size={18} />}
                style={{ background: gradientBg }}
              >
                Sign In
              </Button>
            </form>

            <Divider my="xl" label="New here?" labelPosition="center" />

            <Text c="dimmed" size="sm" ta="center">
              Don't have an account yet?{' '}
              <Link to="/register" style={{ textDecoration: 'none', color: '#7c3aed', fontWeight: 600 }}>
                Create one now
              </Link>
            </Text>
          </Paper>

          <Text c="dimmed" size="xs" ta="center" mt="xl">
            <Group justify="center" gap={4}>
              <IconCheck size={14} />
              Teachers login with Email • Students login with PRN
            </Group>
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;