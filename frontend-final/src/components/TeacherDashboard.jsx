import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CreateClassForm from './CreateClassForm';
import { 
  Title, Text, Button, Container, Paper, Loader, Grid, Card, SimpleGrid, 
  Group, ThemeIcon, Stack, Badge, Avatar, ActionIcon, Tooltip, Box,
  Progress, RingProgress, Modal, Menu, Transition, Flex, Divider,
  rem, useMantineTheme
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconUsers, IconBooks, IconCircleCheck, IconPlus, IconLogout, 
  IconChevronRight, IconCalendarStats, IconClipboardCheck, IconSchool,
  IconDots, IconEye, IconTrash, IconTrendingUp, IconClock, IconSparkles,
  IconUserPlus, IconCamera, IconChartBar
} from '@tabler/icons-react';

// ============================================================================
// OLD TEACHER DASHBOARD CODE (COMMENTED OUT)
// ============================================================================
/*
function TeacherDashboard() {
  const { user, logout, token } = useAuth();
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
*/
// ============================================================================
// NEW MODERN TEACHER DASHBOARD
// ============================================================================

// Gradient backgrounds for stat cards
const gradients = {
  blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  green: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  orange: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  cyan: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
};

// Stat Card Component with gradient background
function StatCard({ icon: Icon, title, value, gradient, subtitle }) {
  return (
    <Paper
      radius="lg"
      p="xl"
      style={{
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          right: -20,
          top: -20,
          opacity: 0.2,
        }}
      >
        <Icon size={120} stroke={1} />
      </Box>
      
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text size="sm" fw={500} style={{ opacity: 0.9 }} tt="uppercase">
            {title}
          </Text>
          <Text size={rem(36)} fw={700} mt={4}>
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" style={{ opacity: 0.8 }} mt={4}>
              {subtitle}
            </Text>
          )}
        </Box>
        <ThemeIcon 
          size={50} 
          radius="xl" 
          variant="white" 
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
        >
          <Icon size={26} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

// Class Card Component with hover effects
function ClassCard({ cls, onDelete }) {
  const studentCount = cls.students?.length || 0;
  
  return (
    <Card 
      component={Link} 
      to={`/class/${cls._id}`}
      withBorder 
      padding="lg" 
      radius="lg"
      style={{
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        textDecoration: 'none',
        borderColor: 'var(--mantine-color-gray-2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = 'var(--mantine-color-blue-4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--mantine-color-gray-2)';
      }}
    >
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Avatar 
            size={45} 
            radius="md" 
            color="blue"
            style={{ background: gradients.blue }}
          >
            <IconBooks size={22} color="white" />
          </Avatar>
          <Box>
            <Text fw={600} size="lg">{cls.name}</Text>
            <Text size="sm" c="dimmed">{cls.subject}</Text>
          </Box>
        </Group>
        <Badge 
          variant="light" 
          color="blue" 
          size="lg"
          leftSection={<IconUsers size={14} />}
        >
          {studentCount} Students
        </Badge>
      </Group>
      
      <Divider my="sm" />
      
      <Group justify="space-between" mt="md">
        <Group gap="xs">
          <Badge variant="outline" color="grape" size="sm">
            {cls.department || 'CSE'}
          </Badge>
          <Badge variant="outline" color="cyan" size="sm">
            {cls.year || '1st'} Year
          </Badge>
          <Badge variant="outline" color="orange" size="sm">
            Sem {cls.semester || '1'}
          </Badge>
        </Group>
        <Group gap={4}>
          <Text size="sm" c="blue" fw={500}>View Details</Text>
          <IconChevronRight size={16} color="var(--mantine-color-blue-6)" />
        </Group>
      </Group>
    </Card>
  );
}

// Quick Action Button Component
function QuickActionButton({ icon: Icon, label, color, onClick }) {
  return (
    <Tooltip label={label} position="bottom">
      <Paper
        p="md"
        radius="lg"
        withBorder
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = `var(--mantine-color-${color}-4)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'var(--mantine-color-gray-2)';
        }}
      >
        <ThemeIcon size={50} radius="xl" color={color} variant="light">
          <Icon size={26} />
        </ThemeIcon>
        <Text size="sm" fw={500} mt="sm">{label}</Text>
      </Paper>
    </Tooltip>
  );
}

function TeacherDashboard() {
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0 });
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);

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

  const handleClassCreated = () => {
    closeCreateModal();
    fetchData();
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Container size="lg" py={100}>
        <Flex direction="column" align="center" gap="md">
          <Loader size="lg" type="dots" />
          <Text c="dimmed">Loading your dashboard...</Text>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py={100}>
        <Paper withBorder p="xl" radius="lg" ta="center">
          <ThemeIcon size={60} radius="xl" color="red" variant="light">
            <IconSparkles size={30} />
          </ThemeIcon>
          <Title order={3} mt="md">Oops! Something went wrong</Title>
          <Text c="dimmed" mt="sm">{error}</Text>
          <Button mt="lg" onClick={fetchData}>Try Again</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box style={{ minHeight: '100vh', background: 'var(--mantine-color-gray-0)' }}>
      {/* Header Section */}
      <Box 
        py="xl" 
        px="md"
        style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
        }}
      >
        <Container size="lg">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Group gap="xs" mb={4}>
                <IconSparkles size={20} style={{ color: '#ffd43b' }} />
                <Text size="sm" style={{ opacity: 0.8 }}>{getCurrentDate()}</Text>
              </Group>
              <Title order={1} fw={700}>
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Teacher'}!
              </Title>
              <Text size="lg" mt={8} style={{ opacity: 0.8 }}>
                Here's what's happening with your classes today.
              </Text>
            </Box>
            <Group>
              <Button 
                leftSection={<IconPlus size={18} />}
                variant="white"
                color="dark"
                radius="xl"
                size="md"
                onClick={openCreateModal}
              >
                Create Class
              </Button>
              <Tooltip label="Logout">
                <ActionIcon 
                  variant="subtle" 
                  color="white" 
                  size="xl" 
                  radius="xl"
                  onClick={logout}
                >
                  <IconLogout size={22} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
          <StatCard 
            icon={IconBooks} 
            title="Total Classes" 
            value={stats.totalClasses}
            gradient={gradients.blue}
            subtitle="Active courses"
          />
          <StatCard 
            icon={IconUsers} 
            title="Total Students" 
            value={stats.totalStudents}
            gradient={gradients.green}
            subtitle="Enrolled students"
          />
          <StatCard 
            icon={IconClipboardCheck} 
            title="Today's Sessions" 
            value={classes.length > 0 ? Math.min(classes.length, 3) : 0}
            gradient={gradients.orange}
            subtitle="Classes scheduled"
          />
          <StatCard 
            icon={IconTrendingUp} 
            title="Avg Attendance" 
            value="87%"
            gradient={gradients.cyan}
            subtitle="This semester"
          />
        </SimpleGrid>

        {/* Quick Actions */}
        <Paper withBorder radius="lg" p="lg" mb="xl">
          <Group justify="space-between" mb="md">
            <Box>
              <Title order={4}>Quick Actions</Title>
              <Text size="sm" c="dimmed">Frequently used features</Text>
            </Box>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <QuickActionButton 
              icon={IconPlus} 
              label="New Class" 
              color="blue"
              onClick={openCreateModal}
            />
            <QuickActionButton 
              icon={IconUserPlus} 
              label="Add Student" 
              color="green"
              onClick={() => classes.length > 0 && window.location.assign(`/class/${classes[0]._id}`)}
            />
            <QuickActionButton 
              icon={IconCamera} 
              label="Take Attendance" 
              color="orange"
              onClick={() => classes.length > 0 && window.location.assign(`/class/${classes[0]._id}`)}
            />
            <QuickActionButton 
              icon={IconChartBar} 
              label="View Reports" 
              color="grape"
              onClick={() => classes.length > 0 && window.location.assign(`/class/${classes[0]._id}`)}
            />
          </SimpleGrid>
        </Paper>

        {/* Classes Section */}
        <Paper withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="lg">
            <Box>
              <Title order={3}>Your Classes</Title>
              <Text size="sm" c="dimmed">Manage and view all your classes</Text>
            </Box>
            <Button 
              variant="light" 
              leftSection={<IconPlus size={16} />}
              radius="xl"
              onClick={openCreateModal}
            >
              Add New
            </Button>
          </Group>

          {classes.length > 0 ? (
            <Stack gap="md">
              {classes.map((cls) => (
                <ClassCard key={cls._id} cls={cls} />
              ))}
            </Stack>
          ) : (
            <Paper 
              withBorder 
              radius="lg" 
              p={60} 
              ta="center"
              style={{ borderStyle: 'dashed' }}
            >
              <ThemeIcon size={80} radius="xl" color="blue" variant="light">
                <IconSchool size={40} />
              </ThemeIcon>
              <Title order={3} mt="lg">No Classes Yet</Title>
              <Text c="dimmed" mt="sm" maw={400} mx="auto">
                Get started by creating your first class. You can then add students and start tracking attendance.
              </Text>
              <Button 
                mt="xl" 
                size="lg" 
                radius="xl"
                leftSection={<IconPlus size={20} />}
                onClick={openCreateModal}
              >
                Create Your First Class
              </Button>
            </Paper>
          )}
        </Paper>
      </Container>

      {/* Create Class Modal */}
      <Modal 
        opened={createModalOpened} 
        onClose={closeCreateModal} 
        title={
          <Group gap="sm">
            <ThemeIcon size={30} radius="xl" color="blue" variant="light">
              <IconPlus size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">Create New Class</Text>
          </Group>
        }
        size="md"
        radius="lg"
        padding="xl"
      >
        <CreateClassForm onClassCreated={handleClassCreated} />
      </Modal>
    </Box>
  );
}

export default TeacherDashboard;