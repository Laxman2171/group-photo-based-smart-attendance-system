import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Checkbox, Button, Box, Text, Loader, Stack, Paper, Group, 
  Avatar, Badge, ThemeIcon, Title, Card, SimpleGrid, ScrollArea,
  TextInput, Center, Flex
} from '@mantine/core';
import { 
  IconUserPlus, IconSearch, IconCheck, IconUsers, IconSchool,
  IconCircleCheck, IconAlertCircle
} from '@tabler/icons-react';

// ============================================================================
// OLD ENROLL STUDENT FORM CODE (COMMENTED OUT)
// ============================================================================
/*
function EnrollStudentForm({ classId, onStudentEnrolled }) {
  const { token } = useAuth();

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

  useEffect(() => {
    fetchUnenrolled();
  }, [classId, token]);

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents(prevSelected =>
      prevSelected.includes(studentId)
        ? prevSelected.filter(id => id !== studentId)
        : [...prevSelected, studentId]
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
      setSelectedStudents([]);
      fetchUnenrolled();
      onStudentEnrolled();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll students.');
    }
  };

  if (isLoading) return <p>Loading available students...</p>;

  return (
    <Box mt="xl">
      <Text size="lg" fw={500}>Enroll New Students</Text>
      {unenrolledStudents.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <Stack mt="md">
            {unenrolledStudents.map(student => (
              <Checkbox
                key={student._id}
                label={`${student.name} (PRN: ${student.prn})`}
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
*/
// ============================================================================
// NEW MODERN ENROLL STUDENT FORM
// ============================================================================

function EnrollStudentForm({ classId, onStudentEnrolled }) {
  const { token } = useAuth();

  const [unenrolledStudents, setUnenrolledStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    fetchUnenrolled();
  }, [classId, token]);

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prevSelected =>
      prevSelected.includes(studentId)
        ? prevSelected.filter(id => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (selectedStudents.length === 0) {
      setError('Please select at least one student to enroll.');
      return;
    }

    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const body = { studentIds: selectedStudents };
      await axios.post(`http://localhost:5000/api/classes/${classId}/enroll`, body, config);

      setSuccess(`Successfully enrolled ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}!`);
      setSelectedStudents([]);
      fetchUnenrolled();
      if (onStudentEnrolled) {
        onStudentEnrolled();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll students.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const colors = ['blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'red', 'pink', 'grape', 'violet', 'indigo'];

  // Filter students based on search
  const filteredStudents = unenrolledStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.prn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Center py="xl">
        <Flex direction="column" align="center" gap="md">
          <Loader size="md" type="dots" />
          <Text size="sm" c="dimmed">Loading available students...</Text>
        </Flex>
      </Center>
    );
  }

  // Success state
  if (success) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <ThemeIcon size={70} radius="xl" color="green" variant="light">
            <IconCircleCheck size={40} />
          </ThemeIcon>
          <Title order={4} ta="center">{success}</Title>
          <Button 
            variant="light" 
            onClick={() => setSuccess('')}
            radius="xl"
          >
            Enroll More Students
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      {unenrolledStudents.length > 0 ? (
        <form onSubmit={handleSubmit}>
          {/* Search & Select All */}
          <Group justify="space-between" mb="md">
            <TextInput
              placeholder="Search students..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              radius="xl"
              style={{ flex: 1 }}
            />
            <Button 
              variant="subtle" 
              size="sm"
              onClick={handleSelectAll}
              leftSection={<IconCheck size={14} />}
            >
              {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
            </Button>
          </Group>

          {/* Selected count */}
          {selectedStudents.length > 0 && (
            <Paper withBorder p="sm" radius="lg" mb="md" style={{ background: 'var(--mantine-color-blue-0)' }}>
              <Group justify="space-between">
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                    <IconUsers size={12} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                  </Text>
                </Group>
                <Button 
                  size="xs" 
                  variant="subtle" 
                  color="red"
                  onClick={() => setSelectedStudents([])}
                >
                  Clear
                </Button>
              </Group>
            </Paper>
          )}

          {/* Student List */}
          <ScrollArea.Autosize mah={350} offsetScrollbars>
            <Stack gap="sm">
              {filteredStudents.map(student => {
                const isSelected = selectedStudents.includes(student._id);
                const colorIndex = student.name.charCodeAt(0) % colors.length;
                
                return (
                  <Card
                    key={student._id}
                    withBorder
                    padding="sm"
                    radius="lg"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
                      background: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                    }}
                    onClick={() => handleStudentToggle(student._id)}
                  >
                    <Group>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        radius="xl"
                        color="blue"
                        style={{ pointerEvents: 'none' }}
                      />
                      <Avatar 
                        size={40} 
                        radius="xl" 
                        color={colors[colorIndex]}
                        src={student.photoUrl}
                      >
                        {getInitials(student.name)}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text fw={500} size="sm">{student.name}</Text>
                        <Text size="xs" c="dimmed">PRN: {student.prn}</Text>
                      </Box>
                      {isSelected && (
                        <Badge color="blue" variant="light" size="sm">
                          Selected
                        </Badge>
                      )}
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>

          {filteredStudents.length === 0 && searchQuery && (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <Text c="dimmed" size="sm">No students match "{searchQuery}"</Text>
                <Button variant="subtle" size="xs" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </Stack>
            </Center>
          )}

          {/* Error */}
          {error && (
            <Paper withBorder p="sm" mt="md" radius="lg" style={{ borderColor: 'var(--mantine-color-red-4)' }}>
              <Group gap="xs">
                <ThemeIcon color="red" variant="light" size="sm" radius="xl">
                  <IconAlertCircle size={14} />
                </ThemeIcon>
                <Text size="sm" c="red">{error}</Text>
              </Group>
            </Paper>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            fullWidth 
            mt="lg"
            size="md"
            radius="xl"
            loading={isSubmitting}
            disabled={selectedStudents.length === 0}
            leftSection={<IconUserPlus size={18} />}
          >
            Enroll {selectedStudents.length > 0 ? `${selectedStudents.length} Student${selectedStudents.length > 1 ? 's' : ''}` : 'Selected Students'}
          </Button>
        </form>
      ) : (
        <Center py="xl">
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="gray" variant="light">
              <IconSchool size={30} />
            </ThemeIcon>
            <Title order={4} c="dimmed">No Students Available</Title>
            <Text size="sm" c="dimmed" ta="center" maw={300}>
              All registered students have already been enrolled in this class, or no students are registered yet.
            </Text>
          </Stack>
        </Center>
      )}
    </Box>
  );
}

export default EnrollStudentForm;