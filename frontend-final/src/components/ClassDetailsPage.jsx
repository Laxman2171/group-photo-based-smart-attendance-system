import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EnrollStudentForm from './EnrollStudentForm';
import MarkAttendanceForm from './MarkAttendanceForm';
import { 
  Container, Title, Text, Paper, Loader, Divider, Group, Button, Box, 
  ThemeIcon, Badge, Avatar, SimpleGrid, Tabs, Stack, Card, ActionIcon,
  Tooltip, Progress, RingProgress, Flex, rem, Modal, Table, ScrollArea
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconCircleCheck, IconArrowLeft, IconDownload, IconUsers, IconCamera,
  IconCalendarStats, IconUserPlus, IconChartBar, IconClipboardCheck,
  IconBook, IconSchool, IconClock, IconFileSpreadsheet, IconPhoto,
  IconChevronRight, IconTrendingUp, IconCalendar, IconX, IconArrowRight,
  IconRefresh
} from '@tabler/icons-react';

// ============================================================================
// OLD CLASS DETAILS PAGE CODE (COMMENTED OUT)
// ============================================================================
/*
function ClassDetailsPage() {
  const { classId } = useParams();
  const { token } = useAuth();

  const [classDetails, setClassDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reportError, setReportError] = useState('');

  const fetchData = async () => {
    if (!token) return;
    try {
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
    fetchData();
  }, [classId, token]);
  
  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
        setReportError('Please select both a "From" and "To" date.');
        return;
    }
    setReportError('');
    try {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
        };
        const body = { fromDate, toDate };
        const response = await axios.post(`http://localhost:5000/api/reports/class-summary/${classId}`, body, config);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `Report-${classDetails.name}.xlsx`;
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
        }
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.error("Failed to generate report", err);
        setReportError(err.response?.data?.message || "Could not generate report.");
    }
  };

  if (isLoading) return <Container p="xl" style={{ display: 'flex', justifyContent: 'center' }}><Loader /></Container>;
  if (error) return <Container p="xl"><Text c="red">{error}</Text></Container>;
  if (!classDetails) return <div>Class not found.</div>;

  return (
    <Container p="md">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Anchor component={Link} to="/teacher-dashboard" c="dimmed" size="sm">
          <Group gap="xs"><IconArrowLeft size={14} />Back to Dashboard</Group>
        </Anchor>
        <Title order={2} mt="md">{classDetails.name}</Title>
        <Text c="dimmed">{classDetails.subject}</Text>
        
        <MarkAttendanceForm classId={classId} />
        <Divider my="xl" />

        <Box style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <Title order={4}>Generate Attendance Report</Title>
            <Group grow mt="md">
                <DatePickerInput label="From Date" placeholder="Select start date" value={fromDate} onChange={setFromDate} />
                <DatePickerInput label="To Date" placeholder="Select end date" value={toDate} onChange={setToDate} />
            </Group>
            <Button mt="md" onClick={handleGenerateReport} leftSection={<IconDownload size={14} />}>Generate Report</Button>
            {reportError && <Text c="red" mt="sm" size="sm">{reportError}</Text>}
        </Box>
        
        <Divider my="xl" />
        <Title order={4}>Enrolled Students</Title>
        {classDetails.students.length > 0 ? (
          <List spacing="xs" size="sm" center mt="md">
            {classDetails.students.map(student => (
              <List.Item key={student._id} icon={<ThemeIcon color="blue" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
                {student.name} (PRN: {student.prn})
              </List.Item>
            ))}
          </List>
        ) : (
          <Text mt="md" c="dimmed">No students have been enrolled in this class yet.</Text>
        )}
        
        <EnrollStudentForm classId={classId} onStudentEnrolled={fetchData} />
      </Paper>
    </Container>
  );
}
*/
// ============================================================================
// NEW MODERN CLASS DETAILS PAGE
// ============================================================================

// Gradient backgrounds
const gradients = {
  blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  green: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  orange: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  cyan: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
};

// Stat Card Component
function StatCard({ icon: Icon, title, value, color, gradient }) {
  return (
    <Paper
      radius="lg"
      p="lg"
      style={{
        background: gradient || 'white',
        color: gradient ? 'white' : 'inherit',
        border: gradient ? 'none' : '1px solid var(--mantine-color-gray-2)',
      }}
    >
      <Group>
        <ThemeIcon 
          size={50} 
          radius="xl" 
          color={color}
          variant={gradient ? 'white' : 'light'}
          style={gradient ? { background: 'rgba(255,255,255,0.2)', color: 'white' } : {}}
        >
          <Icon size={24} />
        </ThemeIcon>
        <Box>
          <Text size="xs" tt="uppercase" fw={600} style={{ opacity: gradient ? 0.9 : 0.7 }}>
            {title}
          </Text>
          <Text size={rem(28)} fw={700}>{value}</Text>
        </Box>
      </Group>
    </Paper>
  );
}

// Student Card Component
function StudentCard({ student }) {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const colors = ['blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'red', 'pink', 'grape', 'violet', 'indigo'];
  const colorIndex = student.name.charCodeAt(0) % colors.length;

  return (
    <Card withBorder padding="sm" radius="lg">
      <Group>
        <Avatar 
          size={45} 
          radius="xl" 
          color={colors[colorIndex]}
          src={student.photoUrl}
        >
          {getInitials(student.name)}
        </Avatar>
        <Box style={{ flex: 1 }}>
          <Text fw={600} size="sm">{student.name}</Text>
          <Text size="xs" c="dimmed">PRN: {student.prn}</Text>
        </Box>
        <Badge variant="light" color="green" size="sm">
          <Group gap={4}>
            <IconCircleCheck size={12} />
            Enrolled
          </Group>
        </Badge>
      </Group>
    </Card>
  );
}

function ClassDetailsPage() {
  const { classId } = useParams();
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get initial tab from URL query param
  const initialTab = searchParams.get('tab') || 'attendance';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [classDetails, setClassDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  
  const [reportModalOpened, { open: openReportModal, close: closeReportModal }] = useDisclosure(false);
  const [enrollModalOpened, { open: openEnrollModal, close: closeEnrollModal }] = useDisclosure(false);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
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

  // Sync students from database based on matching criteria
  const handleSyncStudents = async () => {
    setSyncing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`http://localhost:5000/api/classes/${classId}/sync-students`, {}, config);
      await fetchData(); // Refresh the class data
    } catch (err) {
      console.error("Failed to sync students:", err);
    } finally {
      setSyncing(false);
    }
  };
  
  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [classId, token]);

  // Auto-open modals based on URL query param action
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'enroll' && !isLoading) {
      openEnrollModal();
    } else if (action === 'report' && !isLoading) {
      openReportModal();
    }
  }, [searchParams, isLoading]);
  
  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      setReportError('Please select both a "From" and "To" date.');
      return;
    }
    if (fromDate > toDate) {
      setReportError('"From" date cannot be after "To" date.');
      return;
    }
    setReportError('');
    setReportLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      };
      // Convert dates to ISO strings for consistent backend parsing
      const body = { 
        fromDate: fromDate.toISOString(), 
        toDate: toDate.toISOString() 
      };
      const response = await axios.post(`http://localhost:5000/api/reports/class-summary/${classId}`, body, config);
      
      // Check if response is actually an error (JSON) disguised as blob
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // It's an error response
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        setReportError(errorData.message || 'Could not generate report.');
        setReportLoading(false);
        return;
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Report-${classDetails.name}.xlsx`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      closeReportModal();
    } catch (err) {
      console.error("Failed to generate report", err);
      // Handle blob error response
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);
          setReportError(errorData.message || 'Could not generate report.');
        } catch {
          setReportError('Could not generate report. Please try again.');
        }
      } else {
        setReportError(err.response?.data?.message || 'Could not generate report.');
      }
    } finally {
      setReportLoading(false);
    }
  };

  const handleStudentEnrolled = () => {
    closeEnrollModal();
    fetchData();
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
          <Text c="dimmed">Loading class details...</Text>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py={100}>
        <Paper withBorder p="xl" radius="lg" ta="center">
          <ThemeIcon size={60} radius="xl" color="red" variant="light">
            <IconBook size={30} />
          </ThemeIcon>
          <Title order={3} mt="md">Failed to Load Class</Title>
          <Text c="dimmed" mt="sm">{error}</Text>
          <Button mt="lg" onClick={fetchData}>Try Again</Button>
        </Paper>
      </Container>
    );
  }

  if (!classDetails) return <div>Class not found.</div>;

  const studentCount = classDetails.students?.length || 0;

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
          {/* Back Button */}
          <Button 
            component={Link} 
            to="/teacher-dashboard"
            variant="subtle" 
            color="white"
            leftSection={<IconArrowLeft size={16} />}
            mb="md"
            style={{ opacity: 0.9 }}
          >
            Back to Dashboard
          </Button>

          <Group justify="space-between" align="flex-start">
            <Box>
              <Group gap="md" mb="sm">
                <Avatar 
                  size={60} 
                  radius="lg"
                  style={{ background: gradients.blue }}
                >
                  <IconBook size={28} color="white" />
                </Avatar>
                <Box>
                  <Title order={1} fw={700}>{classDetails.name}</Title>
                  <Text size="lg" style={{ opacity: 0.8 }}>{classDetails.subject}</Text>
                </Box>
              </Group>
              <Group gap="xs" mt="md">
                <Badge variant="light" color="blue" size="lg">{classDetails.department || 'CSE'}</Badge>
                <Badge variant="light" color="cyan" size="lg">{classDetails.year || '1st'} Year</Badge>
                <Badge variant="light" color="teal" size="lg">Semester {classDetails.semester || '1'}</Badge>
              </Group>
            </Box>
            <Text size="sm" style={{ opacity: 0.7 }}>{getCurrentDate()}</Text>
          </Group>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
          <StatCard 
            icon={IconUsers} 
            title="Enrolled Students" 
            value={studentCount}
            gradient={gradients.blue}
          />
          <StatCard 
            icon={IconCalendarStats} 
            title="Total Sessions" 
            value="--"
            color="green"
          />
          <StatCard 
            icon={IconTrendingUp} 
            title="Avg Attendance" 
            value="--"
            color="orange"
          />
          <StatCard 
            icon={IconClock} 
            title="Last Session" 
            value="--"
            color="cyan"
          />
        </SimpleGrid>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab} radius="lg">
          <Paper withBorder radius="lg" mb="lg">
            <Tabs.List grow p="xs">
              <Tabs.Tab 
                value="attendance" 
                leftSection={<IconCamera size={18} />}
                style={{ fontWeight: 500 }}
              >
                Take Attendance
              </Tabs.Tab>
              <Tabs.Tab 
                value="students" 
                leftSection={<IconUsers size={18} />}
                style={{ fontWeight: 500 }}
              >
                Students ({studentCount})
              </Tabs.Tab>
              <Tabs.Tab 
                value="reports" 
                leftSection={<IconChartBar size={18} />}
                style={{ fontWeight: 500 }}
              >
                Reports
              </Tabs.Tab>
            </Tabs.List>
          </Paper>

          {/* Attendance Tab */}
          <Tabs.Panel value="attendance">
            <MarkAttendanceForm classId={classId} />
          </Tabs.Panel>

          {/* Students Tab */}
          <Tabs.Panel value="students">
            <Paper withBorder radius="lg" p="xl">
              <Group justify="space-between" mb="xl">
                <Box>
                  <Title order={3}>Enrolled Students</Title>
                  <Text size="sm" c="dimmed">Manage students in this class</Text>
                </Box>
                <Group>
                  <Tooltip label="Sync students from database matching class criteria">
                    <Button 
                      variant="light"
                      leftSection={<IconRefresh size={18} />}
                      radius="xl"
                      onClick={handleSyncStudents}
                      loading={syncing}
                    >
                      Sync Students
                    </Button>
                  </Tooltip>
                  <Button 
                    leftSection={<IconUserPlus size={18} />}
                    radius="xl"
                    onClick={openEnrollModal}
                  >
                    Enroll Students
                  </Button>
                </Group>
              </Group>

              {studentCount > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {classDetails.students.map(student => (
                    <StudentCard key={student._id} student={student} />
                  ))}
                </SimpleGrid>
              ) : (
                <Paper 
                  withBorder 
                  radius="lg" 
                  p={60} 
                  ta="center"
                  style={{ borderStyle: 'dashed' }}
                >
                  <ThemeIcon size={70} radius="xl" color="blue" variant="light">
                    <IconSchool size={35} />
                  </ThemeIcon>
                  <Title order={3} mt="lg">No Students Yet</Title>
                  <Text c="dimmed" mt="sm" maw={400} mx="auto">
                    Start by enrolling students to this class. They will then appear in attendance records.
                  </Text>
                  <Button 
                    mt="xl" 
                    size="lg" 
                    radius="xl"
                    leftSection={<IconUserPlus size={20} />}
                    onClick={openEnrollModal}
                  >
                    Enroll Your First Student
                  </Button>
                </Paper>
              )}
            </Paper>
          </Tabs.Panel>

          {/* Reports Tab */}
          <Tabs.Panel value="reports">
            <Paper withBorder radius="lg" p="xl">
              <Group justify="space-between" mb="xl">
                <Box>
                  <Title order={3}>Attendance Reports</Title>
                  <Text size="sm" c="dimmed">Generate and download attendance reports</Text>
                </Box>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Card 
                  withBorder 
                  padding="xl" 
                  radius="lg"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={openReportModal}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <ThemeIcon size={60} radius="xl" color="green" variant="light" mb="md">
                    <IconFileSpreadsheet size={30} />
                  </ThemeIcon>
                  <Title order={4}>Excel Report</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    Download detailed attendance data in Excel format with date-wise breakdown.
                  </Text>
                  <Group mt="lg" gap="xs">
                    <Text size="sm" c="green" fw={500}>Generate Report</Text>
                    <IconChevronRight size={16} color="var(--mantine-color-green-6)" />
                  </Group>
                </Card>

                <Card withBorder padding="xl" radius="lg" style={{ opacity: 0.6 }}>
                  <ThemeIcon size={60} radius="xl" color="blue" variant="light" mb="md">
                    <IconChartBar size={30} />
                  </ThemeIcon>
                  <Title order={4}>Visual Analytics</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    View charts and graphs for attendance trends and patterns.
                  </Text>
                  <Badge mt="lg" variant="light" color="gray">Coming Soon</Badge>
                </Card>
              </SimpleGrid>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Container>

      {/* Generate Report Modal */}
      <Modal 
        opened={reportModalOpened} 
        onClose={closeReportModal}
        title={
          <Group gap="sm">
            <ThemeIcon size={35} radius="xl" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <IconFileSpreadsheet size={20} color="white" />
            </ThemeIcon>
            <Box>
              <Text fw={600} size="lg">Generate Report</Text>
              <Text size="xs" c="dimmed">Export attendance to Excel</Text>
            </Box>
          </Group>
        }
        size="lg"
        radius="lg"
        padding="xl"
        styles={{ header: { paddingBottom: 0 } }}
      >
        {/* Visual Date Range Banner */}
        <Paper 
          radius="lg" 
          p="lg" 
          mt="md"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Group justify="space-between" align="center">
            <Box>
              <Text size="xs" style={{ opacity: 0.8 }}>Generating report for</Text>
              <Title order={3} mt={4}>{classDetails?.name}</Title>
              <Text size="sm" style={{ opacity: 0.9 }}>{classDetails?.subject}</Text>
            </Box>
            <ThemeIcon size={50} radius="xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <IconFileSpreadsheet size={26} color="white" />
            </ThemeIcon>
          </Group>
        </Paper>

        <Text size="sm" c="dimmed" mt="xl" mb="lg">
          Select the date range for your attendance export. The report will include all enrolled students with their attendance percentage.
        </Text>
        
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Paper withBorder p="md" radius="lg" style={{ background: 'var(--mantine-color-gray-0)' }}>
            <Group gap="xs" mb="sm">
              <ThemeIcon size={28} radius="xl" color="blue" variant="light">
                <IconCalendar size={16} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Start Date</Text>
            </Group>
            <DatePickerInput 
              placeholder="Pick start date" 
              value={fromDate} 
              onChange={setFromDate}
              radius="md"
              size="md"
              clearable
              valueFormat="DD MMM YYYY"
              styles={{ input: { fontWeight: 500 } }}
            />
          </Paper>
          
          <Paper withBorder p="md" radius="lg" style={{ background: 'var(--mantine-color-gray-0)' }}>
            <Group gap="xs" mb="sm">
              <ThemeIcon size={28} radius="xl" color="violet" variant="light">
                <IconCalendar size={16} />
              </ThemeIcon>
              <Text size="sm" fw={500}>End Date</Text>
            </Group>
            <DatePickerInput 
              placeholder="Pick end date" 
              value={toDate} 
              onChange={setToDate}
              radius="md"
              size="md"
              clearable
              valueFormat="DD MMM YYYY"
              minDate={fromDate || undefined}
              styles={{ input: { fontWeight: 500 } }}
            />
          </Paper>
        </SimpleGrid>

        {/* Quick Date Presets */}
        <Group mt="md" gap="xs">
          <Text size="xs" c="dimmed">Quick select:</Text>
          <Button 
            variant="light" 
            size="xs" 
            radius="xl"
            onClick={() => {
              const today = new Date();
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              setFromDate(weekAgo);
              setToDate(today);
            }}
          >
            Last 7 days
          </Button>
          <Button 
            variant="light" 
            size="xs" 
            radius="xl"
            onClick={() => {
              const today = new Date();
              const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
              setFromDate(monthAgo);
              setToDate(today);
            }}
          >
            Last 30 days
          </Button>
          <Button 
            variant="light" 
            size="xs" 
            radius="xl"
            onClick={() => {
              const today = new Date();
              const semesterStart = new Date(today.getFullYear(), today.getMonth() >= 6 ? 6 : 0, 1);
              setFromDate(semesterStart);
              setToDate(today);
            }}
          >
            This Semester
          </Button>
        </Group>

        {/* Selected Range Preview */}
        {fromDate && toDate && (
          <Paper withBorder p="sm" radius="md" mt="lg" style={{ background: 'var(--mantine-color-green-0)', borderColor: 'var(--mantine-color-green-4)' }}>
            <Group justify="center" gap="lg">
              <Box ta="center">
                <Text size="xs" c="dimmed">From</Text>
                <Text fw={600} c="green.7">{fromDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              </Box>
              <ThemeIcon size={30} radius="xl" color="green" variant="light">
                <IconArrowRight size={16} />
              </ThemeIcon>
              <Box ta="center">
                <Text size="xs" c="dimmed">To</Text>
                <Text fw={600} c="green.7">{toDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              </Box>
            </Group>
          </Paper>
        )}

        {reportError && (
          <Paper withBorder p="sm" mt="md" radius="md" style={{ borderColor: 'var(--mantine-color-red-4)', background: 'var(--mantine-color-red-0)' }}>
            <Group gap="xs">
              <ThemeIcon size={24} radius="xl" color="red" variant="light">
                <IconX size={14} />
              </ThemeIcon>
              <Text c="red" size="sm">{reportError}</Text>
            </Group>
          </Paper>
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={closeReportModal} radius="xl" size="md">
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateReport} 
            loading={reportLoading}
            leftSection={!reportLoading && <IconDownload size={18} />}
            radius="xl"
            size="md"
            disabled={!fromDate || !toDate}
            style={{ background: fromDate && toDate ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : undefined }}
          >
            {reportLoading ? 'Generating...' : 'Download Report'}
          </Button>
        </Group>
      </Modal>

      {/* Enroll Students Modal */}
      <Modal 
        opened={enrollModalOpened} 
        onClose={closeEnrollModal}
        title={
          <Group gap="sm">
            <ThemeIcon size={30} radius="xl" color="blue" variant="light">
              <IconUserPlus size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">Enroll Students</Text>
          </Group>
        }
        size="lg"
        radius="lg"
        padding="xl"
      >
        <EnrollStudentForm classId={classId} onStudentEnrolled={handleStudentEnrolled} />
      </Modal>
    </Box>
  );
}

export default ClassDetailsPage;