import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ClassDetailsPage from './components/ClassDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      
      {/* Protected Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/class/:classId" element={<ClassDetailsPage />} />
      </Route>
      
      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Route>

      {/* Home Redirect Logic */}
      <Route 
        path="/" 
        element={ user ? ( user.role === 'teacher' ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/student-dashboard" /> ) : <Navigate to="/login" /> }
      />
    </Routes>
  );
}

export default App;