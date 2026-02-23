import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import our new useAuth hook
import axios from 'axios';
import { Container, Title, Text, Paper, Loader, Table, Badge, Progress, Button, Center, Grid, Card, ThemeIcon, Group } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';

// This data can be moved to a separate file or fetched from an API in a future version
const masterTimetable = {
  CSE: {
    '4th': {
      '7th': [
        { subject: "Artificial Intelligence & Lab", staff: "Prof. M.S.Otari" },
        { subject: "Cloud Computing & Lab", staff: "Prof. S.S. Konda" },
        { subject: "Big Data Analysis", staff: "Prof. R.D. Kulkarni" },
        { subject: "Block Chain Technology", staff: "Prof. S.C. Papade" },
        { subject: "Deep Learning", staff: "Dr. D.P. Gandhmal" },
        { subject: "Foreign Language Studies", staff: "Prof. S.D. Dudhnikar" }
      ]
    }
  }
};

function StudentDashboard() {
  const { user, logout, token } = useAuth(); // <-- 2. USE the new hook
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const availableSubjects = useMemo(() => {
    if (user && masterTimetable[user.department] && masterTimetable[user.department][user.year] && masterTimetable[user.department][user.year][user.semester]) {
      return masterTimetable[user.department][user.year][user.semester];
    }
    return [];
  }, [user]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!token || !user) {
        setIsLoading(false);
        return;
      };
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:5000/api/attendance/student', config);
        setAttendance(response.data);
      } catch (err) {
        setError("Failed to load attendance data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [token, user]);

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(record => record.status === 'Present').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  const progressColor = attendancePercentage >= 75 ? 'teal' : attendancePercentage >= 50 ? 'yellow' : 'red';

  if (isLoading || !user) return <Center mt="xl"><Loader /></Center>;
  if (error) return <Container p="xl"><Text c="red">{error}</Text></Container>;

  return (
    <Container p="md" size="lg">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2}>Student Dashboard</Title>
        <Text c="dimmed">Welcome! PRN: {user.prn} (Dept: {user.department}, Year: {user.year}, Sem: {user.semester})</Text>
        <Text mt="xl" size="lg" fw={500}>Your Overall Attendance</Text>
        <Progress.Root size={30} mt="sm">
          <Progress.Section value={attendancePercentage} color={progressColor}><Progress.Label>{attendancePercentage}%</Progress.Label></Progress.Section>
        </Progress.Root>
        <Title order={3} mt="xl">Available Subjects for Your Semester</Title>
        {availableSubjects.length > 0 ? (
          <Grid mt="md">
            {availableSubjects.map((item, index) => (
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={index}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Text fw={500}>{item.subject}</Text>
                  <Text size="sm" c="dimmed" mt="sm">Taught by: {item.staff}</Text>
                  <Button variant="light" color="blue" fullWidth mt="md" radius="md">Request to Enroll</Button>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Text mt="md" c="dimmed">No subjects found in the timetable for your department, year, and semester.</Text>
        )}
        <Title order={3} mt="xl">Your Attendance History</Title>
        <Table mt="md" striped withTableBorder withColumnBorders>
          <Table.Thead><Table.Tr><Table.Th>Date</Table.Th><Table.Th>Class</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
          <Table.Tbody>
            {attendance.map(record => (
              <Table.Tr key={record._id}>
                <Table.Td>{new Date(record.date).toLocaleDateString()}</Table.Td>
                <Table.Td>{record.className} ({record.subject})</Table.Td>
                <Table.Td><Badge color={record.status === 'Present' ? 'green' : 'red'} variant="light">{record.status}</Badge></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {attendance.length === 0 && <Text mt="md" ta="center">No attendance records found yet.</Text>}
        <Button onClick={logout} color="red" fullWidth mt="xl">Logout</Button>
      </Paper>
    </Container>
  );
}

export default StudentDashboard;