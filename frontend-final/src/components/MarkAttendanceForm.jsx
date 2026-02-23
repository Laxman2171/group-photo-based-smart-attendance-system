import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FileInput, Button, Box, Text, Paper, Title, Group, ThemeIcon, 
  Stack, Badge, Card, SimpleGrid, Avatar, Progress, Center, rem,
  Transition, Loader, RingProgress, Flex
} from '@mantine/core';
import { 
  IconCamera, IconUpload, IconPhoto, IconX, IconCheck, 
  IconCloudUpload, IconCircleCheck, IconAlertCircle, IconUser,
  IconSparkles
} from '@tabler/icons-react';

// ============================================================================
// OLD MARK ATTENDANCE FORM CODE (COMMENTED OUT)
// ============================================================================
/*
function MarkAttendanceForm({ classId }) {
  const { token } = useAuth();

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
*/
// ============================================================================
// NEW MODERN MARK ATTENDANCE FORM
// ============================================================================

// Gradient for the header
const headerGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

function MarkAttendanceForm({ classId }) {
  const { token } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(''); // 'uploading', 'analyzing', 'done'
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { presentStudents: [], totalDetected: 0 }

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a photo to upload.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Step 1: Upload
      setCurrentStep('uploading');
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

      // Step 2: Analyze with AI
      setCurrentStep('analyzing');
      const markAttendanceConfig = { headers: { Authorization: `Bearer ${token}` } };
      const body = { groupPhotoUrl: groupPhotoUrl };
      const markResponse = await axios.post(`http://localhost:5000/api/attendance/mark/${classId}`, body, markAttendanceConfig);

      const records = markResponse.data.attendance.records;
      const presentStudents = records.filter(record => record.status === 'Present');

      setCurrentStep('done');
      setResult({
        presentStudents: presentStudents,
        totalRecords: records.length,
      });

    } catch (err) {
      console.error("Failed to mark attendance:", err);
      setError(err.response?.data?.message || 'An error occurred during the process.');
      setCurrentStep('');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const colors = ['blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'red', 'pink', 'grape', 'violet', 'indigo'];

  return (
    <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box 
        p="xl" 
        style={{ 
          background: headerGradient,
          color: 'white',
        }}
      >
        <Group gap="md">
          <ThemeIcon size={50} radius="xl" variant="white" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <IconCamera size={26} />
          </ThemeIcon>
          <Box>
            <Title order={3}>Take Attendance</Title>
            <Text size="sm" style={{ opacity: 0.9 }}>Upload a group photo to mark attendance automatically</Text>
          </Box>
        </Group>
      </Box>

      <Box p="xl">
        {/* Show result if available */}
        {result ? (
          <Box>
            {/* Success Header */}
            <Center mb="xl">
              <Stack align="center" gap="md">
                <ThemeIcon size={80} radius="xl" color="green" variant="light">
                  <IconCircleCheck size={45} />
                </ThemeIcon>
                <Title order={2} ta="center">Attendance Marked!</Title>
                <Text c="dimmed" ta="center">
                  Successfully identified {result.presentStudents.length} student{result.presentStudents.length !== 1 ? 's' : ''} as present
                </Text>
              </Stack>
            </Center>

            {/* Stats */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
              <Paper withBorder p="lg" radius="lg" ta="center">
                <RingProgress
                  size={100}
                  thickness={10}
                  roundCaps
                  mx="auto"
                  sections={[
                    { value: result.totalRecords > 0 ? (result.presentStudents.length / result.totalRecords) * 100 : 0, color: 'green' },
                  ]}
                  label={
                    <Center>
                      <Text fw={700} size="xl">{result.presentStudents.length}</Text>
                    </Center>
                  }
                />
                <Text fw={600} mt="md">Present</Text>
                <Text size="sm" c="dimmed">Students found in photo</Text>
              </Paper>

              <Paper withBorder p="lg" radius="lg" ta="center">
                <RingProgress
                  size={100}
                  thickness={10}
                  roundCaps
                  mx="auto"
                  sections={[
                    { value: result.totalRecords > 0 ? ((result.totalRecords - result.presentStudents.length) / result.totalRecords) * 100 : 0, color: 'red' },
                  ]}
                  label={
                    <Center>
                      <Text fw={700} size="xl">{result.totalRecords - result.presentStudents.length}</Text>
                    </Center>
                  }
                />
                <Text fw={600} mt="md">Absent</Text>
                <Text size="sm" c="dimmed">Students not detected</Text>
              </Paper>
            </SimpleGrid>

            {/* Present Students List */}
            {result.presentStudents.length > 0 && (
              <Box>
                <Title order={5} mb="md">
                  <Group gap="xs">
                    <IconSparkles size={18} />
                    Students Detected
                  </Group>
                </Title>
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                  {result.presentStudents.map((record, index) => {
                    const colorIndex = record.student.name.charCodeAt(0) % colors.length;
                    return (
                      <Card key={record.student._id} withBorder padding="sm" radius="lg">
                        <Stack align="center" gap="xs">
                          <Avatar 
                            size={50} 
                            radius="xl" 
                            color={colors[colorIndex]}
                            src={record.student.photoUrl}
                          >
                            {getInitials(record.student.name)}
                          </Avatar>
                          <Text size="sm" fw={500} ta="center" lineClamp={1}>
                            {record.student.name}
                          </Text>
                          <Badge size="xs" color="green" variant="light">Present</Badge>
                        </Stack>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </Box>
            )}

            {/* Take Another Photo Button */}
            <Button 
              fullWidth 
              mt="xl" 
              size="lg" 
              radius="xl"
              variant="light"
              leftSection={<IconCamera size={20} />}
              onClick={clearSelection}
            >
              Take Another Attendance
            </Button>
          </Box>
        ) : (
          /* Upload Form */
          <form onSubmit={handleSubmit}>
            {/* Custom Upload Area / Preview */}
            {!preview ? (
              <Box
                onClick={() => document.getElementById('file-upload-input').click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    handleFileSelect(files[0]);
                  }
                }}
                style={{
                  border: '2px dashed var(--mantine-color-blue-4)',
                  background: 'var(--mantine-color-blue-0)',
                  borderRadius: 'var(--mantine-radius-lg)',
                  minHeight: 200,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mantine-color-blue-6)';
                  e.currentTarget.style.background = 'var(--mantine-color-blue-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mantine-color-blue-4)';
                  e.currentTarget.style.background = 'var(--mantine-color-blue-0)';
                }}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <Group justify="center" gap="xl" mih={200}>
                  <IconPhoto size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                  <div>
                    <Text size="xl" fw={500} ta="center">
                      Drop your class photo here
                    </Text>
                    <Text size="sm" c="dimmed" ta="center" mt="xs">
                      or click to browse files (max 10MB)
                    </Text>
                  </div>
                </Group>
              </Box>
            ) : (
              <Box>
                <Paper 
                  radius="lg" 
                  style={{ 
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      maxHeight: '400px', 
                      objectFit: 'cover',
                      display: 'block',
                    }} 
                  />
                  {!isLoading && (
                    <Button
                      color="red"
                      variant="filled"
                      size="xs"
                      radius="xl"
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                      }}
                      onClick={clearSelection}
                      leftSection={<IconX size={14} />}
                    >
                      Remove
                    </Button>
                  )}
                  
                  {/* Loading Overlay */}
                  {isLoading && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <Loader color="white" size="lg" type="dots" />
                      <Text size="lg" fw={500} mt="md">
                        {currentStep === 'uploading' && 'Uploading photo...'}
                        {currentStep === 'analyzing' && 'AI analyzing faces...'}
                      </Text>
                      <Text size="sm" style={{ opacity: 0.8 }} mt="xs">
                        This may take a few moments
                      </Text>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}

            {/* Error Message */}
            {error && (
              <Paper withBorder p="md" mt="lg" radius="lg" style={{ borderColor: 'var(--mantine-color-red-4)' }}>
                <Group gap="sm">
                  <ThemeIcon color="red" variant="light" size="lg" radius="xl">
                    <IconAlertCircle size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={500} c="red">Error</Text>
                    <Text size="sm" c="dimmed">{error}</Text>
                  </Box>
                </Group>
              </Paper>
            )}

            {/* Submit Button */}
            {preview && !isLoading && (
              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                mt="xl"
                radius="xl"
                leftSection={<IconSparkles size={20} />}
                style={{ background: headerGradient }}
              >
                Analyze & Mark Attendance
              </Button>
            )}

            {/* Alternative file input */}
            {!preview && (
              <Group justify="center" mt="md">
                <Text size="sm" c="dimmed">or</Text>
              </Group>
            )}
            {!preview && (
              <FileInput
                placeholder="Browse from device"
                accept="image/*"
                mt="sm"
                radius="xl"
                size="md"
                leftSection={<IconUpload size={16} />}
                onChange={handleFileSelect}
                style={{ maxWidth: 300, margin: '0 auto' }}
              />
            )}
          </form>
        )}
      </Box>
    </Paper>
  );
}

export default MarkAttendanceForm;