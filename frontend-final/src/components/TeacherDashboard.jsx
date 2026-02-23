import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import our new useAuth hook
import axios from 'axios';
import CreateClassForm from './CreateClassForm';
import { Title, Text, Button, Container, Paper, Loader, Divider, Grid, Card, SimpleGrid, Group, ThemeIcon, Stack } from '@mantine/core';
import { IconUsers, IconBooks, IconCircleCheck } from '@tabler/icons-react';

function TeacherDashboard() {
  const { user, logout, token } = useAuth(); // <-- 2. USE the new hook
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0 });
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsResponse, classesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/teachers/dashboard-stats', config),
        axios.get('http://localhost:5000/api/classes/teacher', config)
      ]);
      setStats(statsResponse.data);
      setClasses(classesResponse.data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (isLoading) return <Container p="xl" style={{ display: 'flex', justifyContent: 'center' }}><Loader /></Container>;
  if (error) return <Container p="xl"><Text c="red">Error: {error}</Text></Container>;

  return (
    <Container size="lg" my="xl">
      <Title order={2}>Teacher Dashboard</Title>
      <Text c="dimmed">Welcome back, {user?.name || 'Teacher'}!</Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
        <Paper withBorder p="md" radius="md">
          <Group>
            <ThemeIcon color="blue" variant="light" size={48} radius="md"><IconBooks size={28} /></ThemeIcon>
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Classes</Text>
              <Text fw={700} size="xl">{stats.totalClasses}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group>
            <ThemeIcon color="teal" variant="light" size={48} radius="md"><IconUsers size={28} /></ThemeIcon>
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Students</Text>
              <Text fw={700} size="xl">{stats.totalStudents}</Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>
      <Grid mt="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="lg" radius="md" h="100%">
            <Title order={3}>Your Classes</Title>
            {classes.length > 0 ? (
              <Stack mt="md">
                {classes.map(cls => (
                  <Card component={Link} to={`/class/${cls._id}`} withBorder padding="sm" radius="md" key={cls._id}>
                    <Group>
                      <ThemeIcon color="blue" variant="light" radius="xl"><IconCircleCheck size={16} /></ThemeIcon>
                      <Text fw={500}>{cls.name}</Text>
                      <Text size="sm" c="dimmed">({cls.subject})</Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Text mt="md" c="dimmed">You have not created any classes yet.</Text>
            )}
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="lg" radius="md" h="100%">
            <CreateClassForm onClassCreated={fetchData} />
          </Paper>
        </Grid.Col>
      </Grid>
      <Button onClick={logout} color="red" fullWidth mt="xl">Logout</Button>
    </Container>
  );
}

export default TeacherDashboard;