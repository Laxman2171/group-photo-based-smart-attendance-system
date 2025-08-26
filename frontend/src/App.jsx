import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage'; // <-- 1. IMPORT THE NEW PAGE
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ClassDetailsPage from './components/ClassDetailsPage';
import './App.css';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/" />} 
      />

      {/* --- 2. ADD THE NEW REGISTER ROUTE --- */}
      <Route 
        path="/register" 
        element={!user ? <RegisterPage /> : <Navigate to="/" />} 
      />
      {/* ------------------------------------ */}

      <Route 
        path="/teacher-dashboard" 
        element={user && user.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} 
      />

      <Route 
        path="/class/:classId" 
        element={user && user.role === 'teacher' ? <ClassDetailsPage /> : <Navigate to="/login" />} 
      />

      <Route 
        path="/student-dashboard" 
        element={user && user.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
      />

      <Route 
        path="/" 
        element={
          !user ? (
            <Navigate to="/login" />
          ) : user.role === 'teacher' ? (
            <Navigate to="/teacher-dashboard" />
          ) : (
            <Navigate to="/student-dashboard" />
          )
        } 
      />
    </Routes>
  );
}

export default App;