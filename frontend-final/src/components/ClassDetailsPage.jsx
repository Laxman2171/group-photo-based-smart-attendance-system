import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EnrollStudentForm from './EnrollStudentForm';
import MarkAttendanceForm from './MarkAttendanceForm';
import { Container, Title, Text, Paper, List, Loader, Divider, Anchor, Group, Button, Box, ThemeIcon } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCircleCheck, IconArrowLeft, IconDownload } from '@tabler/icons-react';

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

export default ClassDetailsPage;