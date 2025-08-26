import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import EnrollStudentForm from './EnrollStudentForm';
import MarkAttendanceForm from './MarkAttendanceForm'; // <-- 1. IMPORT THE NEW COMPONENT
import { Container, Title, Text, Paper, List, Loader, Divider, ThemeIcon, Anchor, Group } from '@mantine/core';
import { IconCircleCheck, IconArrowLeft } from '@tabler/icons-react';

function ClassDetailsPage() {
  const { classId } = useParams();
  const { token } = useContext(AuthContext);

  const [classDetails, setClassDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClassDetails = async () => {
    if (!token) return;
    try {
      // No setIsLoading here for smoother refetching
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5000/api/classes/${classId}`, config);
      setClassDetails(response.data);
    } catch (err) {
      setError("Failed to fetch class details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchClassDetails();
  }, [classId, token]);

  if (isLoading) return <Container p="xl" style={{ display: 'flex', justifyContent: 'center' }}><Loader /></Container>;
  if (error) return <Container p="xl"><Text c="red">{error}</Text></Container>;
  if (!classDetails) return <div>Class not found.</div>;

  return (
    <Container p="md">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Anchor component={Link} to="/teacher-dashboard" c="dimmed" size="sm">
          <Group gap="xs">
            <IconArrowLeft size={14} />
            Back to Dashboard
          </Group>
        </Anchor>

        <Title order={2} mt="md">{classDetails.name}</Title>
        <Text c="dimmed">{classDetails.subject}</Text>

        {/* --- 2. ADD THE NEW COMPONENT HERE --- */}
        <MarkAttendanceForm classId={classId} />

        <Divider my="xl" />

        <Title order={4}>Enrolled Students</Title>
        {classDetails.students.length > 0 ? (
          <List spacing="xs" size="sm" center mt="md">
            {classDetails.students.map(student => (
              <List.Item
                key={student._id}
                icon={<ThemeIcon color="blue" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}
              >
                {student.name} (Roll: {student.roll})
              </List.Item>
            ))}
          </List>
        ) : (
          <Text mt="md" c="dimmed">No students have been enrolled in this class yet.</Text>
        )}

        <EnrollStudentForm classId={classId} onStudentEnrolled={fetchClassDetails} />
      </Paper>
    </Container>
  );
}

export default ClassDetailsPage;