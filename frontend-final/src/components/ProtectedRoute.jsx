import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import our new useAuth hook
import { Loader, Center } from '@mantine/core';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, isLoading } = useAuth(); // <-- 2. USE the new hook

  // Show a loading spinner while we check for a logged-in user
  if (isLoading) {
    return <Center style={{ height: '100vh' }}><Loader /></Center>;
  }

  // If loading is finished and there's no user/token, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If a user exists but their role is not allowed, redirect them to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const homePath = user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
    return <Navigate to={homePath} replace />;
  }

  // If everything is okay, show the requested page
  return <Outlet />;
};

export default ProtectedRoute;