import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  TextInput, PasswordInput, Button, Box, Title, Paper, Text, FileInput, 
  Select, Group, SegmentedControl, MultiSelect, ThemeIcon, Stack, 
  Divider, Center, rem, Stepper, Badge, Avatar, SimpleGrid
} from '@mantine/core';
import { 
  IconCamera, IconUser, IconMail, IconLock, IconId, IconSchool,
  IconUpload, IconArrowRight, IconArrowLeft, IconCheck, IconBooks,
  IconUserPlus, IconSparkles
} from '@tabler/icons-react';

// ============================================================================
// OLD REGISTER PAGE CODE (COMMENTED OUT)
// ============================================================================
/*
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
    const { login } = useAuth();

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
              ...
            </form>
          </Paper>
        </Box>
    );
}
*/
// ============================================================================
// NEW MODERN REGISTER PAGE
// ============================================================================

const gradientBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

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
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      let response;
      if (role === 'student') {
        if (!photo) {
          setError('Please upload a profile photo for face recognition.');
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

          <Title order={1} c="white" mb="lg" style={{ fontSize: rem(38), lineHeight: 1.2 }}>
            Join the Future of Attendance Tracking
          </Title>
          
          <Text size="lg" c="white" style={{ opacity: 0.9 }} mb={rem(40)}>
            Create your account and experience seamless AI-powered attendance management.
          </Text>

          <Stack gap="lg">
            <Group gap="md">
              <ThemeIcon size={45} radius="xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <IconUserPlus size={22} color="white" />
              </ThemeIcon>
              <Box>
                <Text fw={600} c="white">Quick Registration</Text>
                <Text size="sm" style={{ opacity: 0.8 }} c="white">Get started in minutes</Text>
              </Box>
            </Group>
            <Group gap="md">
              <ThemeIcon size={45} radius="xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <IconCamera size={22} color="white" />
              </ThemeIcon>
              <Box>
                <Text fw={600} c="white">Face Recognition</Text>
                <Text size="sm" style={{ opacity: 0.8 }} c="white">Students upload photo for AI matching</Text>
              </Box>
            </Group>
            <Group gap="md">
              <ThemeIcon size={45} radius="xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <IconSparkles size={22} color="white" />
              </ThemeIcon>
              <Box>
                <Text fw={600} c="white">Automatic Attendance</Text>
                <Text size="sm" style={{ opacity: 0.8 }} c="white">No manual roll calls needed</Text>
              </Box>
            </Group>
          </Stack>
        </Box>
      </Box>

      {/* Right Side - Registration Form */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: rem(40),
          background: 'var(--mantine-color-gray-0)',
          overflowY: 'auto',
        }}
      >
        <Box style={{ width: '100%', maxWidth: 480 }}>
          {/* Mobile Logo */}
          <Center mb="lg" hiddenFrom="md">
            <Group gap="sm">
              <ThemeIcon size={40} radius="xl" style={{ background: gradientBg }}>
                <IconCamera size={22} color="white" />
              </ThemeIcon>
              <Title order={3}>Smart Attendance</Title>
            </Group>
          </Center>

          <Paper withBorder shadow="xl" p={rem(35)} radius="lg">
            <Title order={2} ta="center" mb={rem(8)}>
              Create Account
            </Title>
            <Text c="dimmed" ta="center" mb="lg">
              Join as a teacher or student
            </Text>

            {/* Role Selector */}
            <SegmentedControl 
              fullWidth 
              value={role} 
              onChange={setRole} 
              radius="md"
              size="md"
              data={[
                { 
                  label: (
                    <Center style={{ gap: 8 }}>
                      <IconSchool size={18} />
                      <span>Student</span>
                    </Center>
                  ), 
                  value: 'student' 
                },
                { 
                  label: (
                    <Center style={{ gap: 8 }}>
                      <IconBooks size={18} />
                      <span>Teacher</span>
                    </Center>
                  ), 
                  value: 'teacher' 
                }
              ]} 
              mb="xl"
              styles={{
                root: { background: 'var(--mantine-color-gray-1)' },
              }}
            />

            <form onSubmit={handleSubmit}>
              {/* Common: Name */}
              <TextInput 
                label="Full Name" 
                placeholder="Enter your full name" 
                required 
                size="md"
                radius="md"
                leftSection={<IconUser size={18} />}
                value={name} 
                onChange={(event) => setName(event.currentTarget.value)} 
              />

              {role === 'student' ? (
                <>
                  {/* Student Fields */}
                  <SimpleGrid cols={2} mt="md">
                    <TextInput 
                      label="PRN Number" 
                      placeholder="Your PRN" 
                      required 
                      size="md"
                      radius="md"
                      leftSection={<IconId size={18} />}
                      value={prn} 
                      onChange={(event) => setPrn(event.currentTarget.value)} 
                    />
                    <TextInput 
                      label="Email" 
                      type="email" 
                      placeholder="College email" 
                      required 
                      size="md"
                      radius="md"
                      leftSection={<IconMail size={18} />}
                      value={studentEmail} 
                      onChange={(event) => setStudentEmail(event.currentTarget.value)} 
                    />
                  </SimpleGrid>
                  
                  <SimpleGrid cols={2} mt="md">
                    <Select 
                      label="Department" 
                      data={['CSE', 'IT', 'ENTC', 'Civil', 'Mech']} 
                      value={studentDepartment} 
                      onChange={setStudentDepartment}
                      size="md"
                      radius="md"
                    />
                    <Select 
                      label="Year" 
                      data={['1st', '2nd', '3rd', '4th']} 
                      value={year} 
                      onChange={setYear}
                      size="md"
                      radius="md"
                    />
                  </SimpleGrid>
                  
                  <Select 
                    mt="md" 
                    label="Semester" 
                    data={['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']} 
                    value={semester} 
                    onChange={setSemester}
                    size="md"
                    radius="md"
                  />
                  
                  {/* Photo Upload - Important for face recognition */}
                  <Box mt="md">
                    <Text size="sm" fw={500} mb={6}>
                      Profile Photo <Text span c="red">*</Text>
                    </Text>
                    <Paper 
                      withBorder 
                      p="md" 
                      radius="md"
                      style={{ 
                        borderStyle: photo ? 'solid' : 'dashed',
                        borderColor: photo ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-gray-4)',
                        background: photo ? 'var(--mantine-color-green-0)' : 'var(--mantine-color-gray-0)',
                      }}
                    >
                      {photo ? (
                        <Group>
                          <Avatar 
                            src={URL.createObjectURL(photo)} 
                            size={60} 
                            radius="md"
                          />
                          <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>{photo.name}</Text>
                            <Text size="xs" c="dimmed">{(photo.size / 1024).toFixed(1)} KB</Text>
                          </Box>
                          <Button 
                            variant="subtle" 
                            color="red" 
                            size="xs"
                            onClick={() => setPhoto(null)}
                          >
                            Remove
                          </Button>
                        </Group>
                      ) : (
                        <FileInput
                          placeholder="Upload a clear face photo"
                          leftSection={<IconUpload size={18} />}
                          accept="image/*"
                          value={photo}
                          onChange={setPhoto}
                          variant="unstyled"
                          size="md"
                          styles={{ input: { cursor: 'pointer' } }}
                        />
                      )}
                    </Paper>
                    <Text size="xs" c="dimmed" mt={4}>
                      <IconCamera size={12} style={{ verticalAlign: 'middle' }} /> Required for face recognition attendance
                    </Text>
                  </Box>
                </>
              ) : (
                <>
                  {/* Teacher Fields */}
                  <TextInput 
                    label="Email" 
                    placeholder="Enter your email" 
                    required 
                    mt="md" 
                    size="md"
                    radius="md"
                    leftSection={<IconMail size={18} />}
                    value={email} 
                    onChange={(event) => setEmail(event.currentTarget.value)} 
                  />
                  <MultiSelect 
                    label="Departments" 
                    placeholder="Select departments you teach" 
                    data={['CSE', 'IT', 'ENTC', 'Civil', 'Mech']} 
                    value={teacherDepartments} 
                    onChange={setTeacherDepartments} 
                    required 
                    mt="md"
                    size="md"
                    radius="md"
                  />
                </>
              )}

              {/* Password */}
              <PasswordInput 
                label="Password" 
                placeholder="Choose a strong password" 
                required 
                mt="md" 
                size="md"
                radius="md"
                leftSection={<IconLock size={18} />}
                value={password} 
                onChange={(event) => setPassword(event.currentTarget.value)} 
              />
              
              {/* Error */}
              {error && (
                <Paper withBorder p="sm" mt="md" radius="md" style={{ borderColor: 'var(--mantine-color-red-4)', background: 'var(--mantine-color-red-0)' }}>
                  <Text c="red" size="sm" ta="center">{error}</Text>
                </Paper>
              )}

              {/* Submit */}
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
                Create Account
              </Button>
            </form>

            <Divider my="xl" label="Already registered?" labelPosition="center" />

            <Text c="dimmed" size="sm" ta="center">
              Have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: '#7c3aed', fontWeight: 600 }}>
                Sign in instead
              </Link>
            </Text>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default RegisterPage;