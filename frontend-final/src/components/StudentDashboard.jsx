import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Container, Title, Text, Paper, Loader, Table, Badge, Progress, Button, Center, 
  Grid, Card, ThemeIcon, Group, Box, Avatar, Stack, RingProgress, SimpleGrid,
  rem, Divider, ScrollArea, Tabs, ActionIcon, Tooltip
} from '@mantine/core';
import { 
  IconBook, IconUser, IconCalendarStats, IconCheck, IconX, IconSchool,
  IconClipboardCheck, IconPercentage, IconLogout, IconChartBar,
  IconClock, IconCalendar, IconTrendingUp, IconBooks
} from '@tabler/icons-react';

// ============================================================================
// OLD STUDENT DASHBOARD CODE (COMMENTED OUT)
// ============================================================================
/*
function StudentDashboard() {
    const { user, logout, token } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    ... basic layout with Paper and Table ...
}
*/
// ============================================================================
// NEW MODERN STUDENT DASHBOARD
// ============================================================================

const gradientBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const greenGradient = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
const blueGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const orangeGradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

// Timetable data
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

// Stat Card Component
function StatCard({ icon, label, value, gradient, subtitle }) {
  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }}
      />
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text size="sm" style={{ opacity: 0.9 }}>{label}</Text>
          <Title order={2} mt={4}>{value}</Title>
          {subtitle && <Text size="xs" style={{ opacity: 0.8 }} mt={4}>{subtitle}</Text>}
        </Box>
        <ThemeIcon
          size={50}
          radius="xl"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

function StudentDashboard() {
  const { user, logout, token } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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
  const absentClasses = totalClasses - presentClasses;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  const progressColor = attendancePercentage >= 75 ? 'teal' : attendancePercentage >= 50 ? 'yellow' : 'red';

  // Get recent attendance (last 5)
  const recentAttendance = [...attendance].slice(-5).reverse();

  if (isLoading || !user) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="xl" />
          <Text c="dimmed">Loading your dashboard...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container p="xl">
        <Paper withBorder p="xl" radius="lg" style={{ borderColor: 'var(--mantine-color-red-4)' }}>
          <Center>
            <Stack align="center">
              <ThemeIcon size={60} radius="xl" color="red" variant="light">
                <IconX size={30} />
              </ThemeIcon>
              <Text c="red" fw={500}>{error}</Text>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  return (
    <Box style={{ minHeight: '100vh', background: 'var(--mantine-color-gray-0)' }}>
      {/* Header */}
      <Box
        style={{
          background: gradientBg,
          padding: rem(30),
          paddingBottom: rem(80),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <Box style={{ position: 'absolute', bottom: -30, left: '30%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
          <Group justify="space-between" align="flex-start">
            <Group gap="lg">
              <Avatar
                size={70}
                radius="xl"
                src={user.profilePhoto}
                style={{ border: '3px solid rgba(255,255,255,0.3)' }}
              >
                {user.name?.charAt(0)}
              </Avatar>
              <Box>
                <Text size="sm" c="white" style={{ opacity: 0.8 }}>Welcome back,</Text>
                <Title order={2} c="white">{user.name}</Title>
                <Group gap="xs" mt={4}>
                  <Badge variant="white" size="sm" leftSection={<IconSchool size={12} />}>
                    {user.department}
                  </Badge>
                  <Badge variant="white" size="sm">
                    {user.year} Year
                  </Badge>
                  <Badge variant="white" size="sm">
                    Sem {user.semester}
                  </Badge>
                </Group>
              </Box>
            </Group>
            <Tooltip label="Logout">
              <ActionIcon
                variant="white"
                size="lg"
                radius="xl"
                onClick={logout}
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <IconLogout size={20} color="white" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="lg" style={{ marginTop: rem(-50), position: 'relative', zIndex: 2, paddingBottom: rem(40) }}>
        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
          <StatCard
            icon={<IconClipboardCheck size={24} color="white" />}
            label="Total Classes"
            value={totalClasses}
            gradient={blueGradient}
            subtitle="Classes attended"
          />
          <StatCard
            icon={<IconCheck size={24} color="white" />}
            label="Present"
            value={presentClasses}
            gradient={greenGradient}
            subtitle={`${attendancePercentage}% attendance`}
          />
          <StatCard
            icon={<IconX size={24} color="white" />}
            label="Absent"
            value={absentClasses}
            gradient={orangeGradient}
            subtitle="Classes missed"
          />
          <StatCard
            icon={<IconBooks size={24} color="white" />}
            label="Subjects"
            value={availableSubjects.length}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            subtitle="This semester"
          />
        </SimpleGrid>

        {/* Attendance Ring Progress */}
        <Paper withBorder shadow="sm" p="xl" radius="lg" mb="xl">
          <Group justify="space-between" align="center" wrap="wrap">
            <Box>
              <Title order={3}>Your Attendance Overview</Title>
              <Text c="dimmed" size="sm">Keep up the good work!</Text>
            </Box>
            <Group gap="xl">
              <RingProgress
                size={140}
                thickness={14}
                roundCaps
                sections={[{ value: attendancePercentage, color: progressColor }]}
                label={
                  <Center>
                    <Stack gap={0} align="center">
                      <Text fw={700} size="xl">{attendancePercentage}%</Text>
                      <Text size="xs" c="dimmed">Attendance</Text>
                    </Stack>
                  </Center>
                }
              />
              <Stack gap="xs">
                <Group gap="xs">
                  <Box style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--mantine-color-teal-5)' }} />
                  <Text size="sm">Present: {presentClasses}</Text>
                </Group>
                <Group gap="xs">
                  <Box style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--mantine-color-red-5)' }} />
                  <Text size="sm">Absent: {absentClasses}</Text>
                </Group>
                <Group gap="xs">
                  <Box style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--mantine-color-blue-5)' }} />
                  <Text size="sm">Total: {totalClasses}</Text>
                </Group>
              </Stack>
            </Group>
          </Group>
          {attendancePercentage < 75 && (
            <Paper p="sm" mt="md" radius="md" style={{ background: 'var(--mantine-color-yellow-0)', border: '1px solid var(--mantine-color-yellow-4)' }}>
              <Group gap="xs">
                <IconTrendingUp size={18} color="var(--mantine-color-yellow-7)" />
                <Text size="sm" c="yellow.8">Your attendance is below 75%. Try to attend more classes!</Text>
              </Group>
            </Paper>
          )}
        </Paper>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab} radius="lg">
          <Tabs.List mb="lg">
            <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
              Recent Activity
            </Tabs.Tab>
            <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>
              Subjects
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconCalendar size={16} />}>
              Full History
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Paper withBorder shadow="sm" p="lg" radius="lg">
              <Title order={4} mb="md">Recent Attendance</Title>
              {recentAttendance.length > 0 ? (
                <Stack gap="sm">
                  {recentAttendance.map(record => (
                    <Paper key={record._id} withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-gray-0)' }}>
                      <Group justify="space-between">
                        <Group>
                          <ThemeIcon 
                            size={40} 
                            radius="xl" 
                            color={record.status === 'Present' ? 'teal' : 'red'}
                            variant="light"
                          >
                            {record.status === 'Present' ? <IconCheck size={20} /> : <IconX size={20} />}
                          </ThemeIcon>
                          <Box>
                            <Text fw={500}>{record.className}</Text>
                            <Text size="xs" c="dimmed">{record.subject}</Text>
                          </Box>
                        </Group>
                        <Box ta="right">
                          <Badge color={record.status === 'Present' ? 'teal' : 'red'} variant="light">
                            {record.status}
                          </Badge>
                          <Text size="xs" c="dimmed" mt={4}>
                            {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Text>
                        </Box>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Center py="xl">
                  <Stack align="center" gap="sm">
                    <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                      <IconCalendarStats size={30} />
                    </ThemeIcon>
                    <Text c="dimmed">No attendance records yet</Text>
                  </Stack>
                </Center>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="subjects">
            <Paper withBorder shadow="sm" p="lg" radius="lg">
              <Title order={4} mb="md">Subjects for This Semester</Title>
              {availableSubjects.length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {availableSubjects.map((item, index) => (
                    <Card 
                      key={index} 
                      withBorder 
                      padding="lg" 
                      radius="lg"
                      style={{
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <ThemeIcon size={45} radius="xl" style={{ background: gradientBg }} mb="md">
                        <IconBook size={22} color="white" />
                      </ThemeIcon>
                      <Text fw={600} size="md">{item.subject}</Text>
                      <Text size="sm" c="dimmed" mt="xs">
                        <IconUser size={14} style={{ verticalAlign: 'middle' }} /> {item.staff}
                      </Text>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Center py="xl">
                  <Stack align="center" gap="sm">
                    <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                      <IconBooks size={30} />
                    </ThemeIcon>
                    <Text c="dimmed">No subjects found for your semester</Text>
                  </Stack>
                </Center>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <Paper withBorder shadow="sm" radius="lg" style={{ overflow: 'hidden' }}>
              <Box p="lg" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Title order={4}>Complete Attendance History</Title>
              </Box>
              <ScrollArea h={400}>
                <Table striped highlightOnHover>
                  <Table.Thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Class</Table.Th>
                      <Table.Th>Subject</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {attendance.map(record => (
                      <Table.Tr key={record._id}>
                        <Table.Td>
                          <Text size="sm">{new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>{record.className}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{record.subject}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={record.status === 'Present' ? 'teal' : 'red'} 
                            variant="light"
                            leftSection={record.status === 'Present' ? <IconCheck size={12} /> : <IconX size={12} />}
                          >
                            {record.status}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                {attendance.length === 0 && (
                  <Center py="xl">
                    <Text c="dimmed">No attendance records found</Text>
                  </Center>
                )}
              </ScrollArea>
            </Paper>
          </Tabs.Panel>
        </Tabs>

        {/* PRN Info Card */}
        <Paper withBorder shadow="sm" p="lg" radius="lg" mt="xl">
          <Group justify="space-between" align="center">
            <Group>
              <ThemeIcon size={45} radius="xl" variant="light" color="violet">
                <IconUser size={22} />
              </ThemeIcon>
              <Box>
                <Text size="sm" c="dimmed">Your PRN</Text>
                <Text fw={600} size="lg">{user.prn}</Text>
              </Box>
            </Group>
            <Button 
              variant="light" 
              color="red" 
              leftSection={<IconLogout size={16} />}
              onClick={logout}
            >
              Logout
            </Button>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}

export default StudentDashboard;