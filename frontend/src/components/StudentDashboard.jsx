import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Container, Title, Text, Paper, Loader, Table, Badge, Progress, Button, Center, Grid, Card, ThemeIcon, Group } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';

function StudentDashboard() {
  const { user, logout, token } = useContext(AuthContext);

  // State for the two different sets of data we need
  const [attendance, setAttendance] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user) {
        setIsLoading(false);
        return;
      };
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Use Promise.all to fetch both sets of data at the same time for speed
        const [attendanceRes, availableClassesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/attendance/student', config),
          axios.get('http://localhost:5000/api/classes/available', config)
        ]);

        setAttendance(attendanceRes.data);
        setAvailableClasses(availableClassesRes.data);

      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, user]);

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(record => record.status === 'Present').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  const progressColor = attendancePercentage >= 75 ? 'teal' : attendancePercentage >= 50 ? 'yellow' : 'red';

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (error) return <Container p="xl"><Text c="red">{error}</Text></Container>;

  return (
    <Container p="md" size="lg">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2}>Student Dashboard</Title>
        {user && <Text c="dimmed">Welcome! PRN: {user.prn} (Dept: {user.department}, Year: {user.year}, Sem: {user.semester})</Text>}

        <Text mt="xl" size="lg" fw={500}>Your Overall Attendance</Text>
        <Progress.Root size={30} mt="sm">
          <Progress.Section value={attendancePercentage} color={progressColor}><Progress.Label>{attendancePercentage}%</Progress.Label></Progress.Section>
        </Progress.Root>

        <Title order={3} mt="xl">Available Classes for Your Semester</Title>
        {availableClasses.length > 0 ? (
          <Grid mt="md">
            {availableClasses.map((cls) => (
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={cls._id}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group>
                    <ThemeIcon color="blue" variant="light"><IconBook size={24} /></ThemeIcon>
                    <Text fw={500}>{cls.subject}</Text>
                  </Group>
                  <Text size="sm" c="dimmed" mt="sm">Taught by: {cls.teacher.name}</Text>
                  <Button variant="light" color="blue" fullWidth mt="md" radius="md">Request to Enroll</Button>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Text mt="md" c="dimmed">No classes are currently available for enrollment in your department/semester.</Text>
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