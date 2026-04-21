import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { AuthProvider } from './contexts/AuthContext';
import MainNavBar from './components/common/Main_NavBar';
import Sidebar from './components/focus-wishwaka/Sidebar';
import PrivateRoute from './components/auth/PrivateRoute';
// Public pages
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
// Private pages
import Dashboard from './pages/focus-wishwaka/Dashboard';
import Goals from './pages/focus-wishwaka/Goals';
import FocusTimer from './pages/focus-wishwaka/FocusTimer';
import Wellness from './pages/focus-wishwaka/Wellness';
import Settings from './pages/focus-wishwaka/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    secondary: {
      main: '#3498db',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Private Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ ml: { md: '240px' } }}>
                  <MainNavBar />
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Sidebar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: { md: `calc(100% - 240px)` },
                    }}
                  >
                    <Dashboard />
                  </Box>
                </Box>
              </Box>
            </PrivateRoute>
          } />
          
          <Route path="/goals" element={
            <PrivateRoute>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ ml: { md: '240px' } }}>
                  <MainNavBar />
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Sidebar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: { md: `calc(100% - 240px)` },
                    }}
                  >
                    <Goals />
                  </Box>
                </Box>
              </Box>
            </PrivateRoute>
          } />
          
          <Route path="/focus-timer" element={
            <PrivateRoute>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ ml: { md: '240px' } }}>
                  <MainNavBar />
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Sidebar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: { md: `calc(100% - 240px)` },
                    }}
                  >
                    <FocusTimer />
                  </Box>
                </Box>
              </Box>
            </PrivateRoute>
          } />
          
          <Route path="/wellness" element={
            <PrivateRoute>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ ml: { md: '240px' } }}>
                  <MainNavBar />
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Sidebar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: { md: `calc(100% - 240px)` },
                    }}
                  >
                    <Wellness />
                  </Box>
                </Box>
              </Box>
            </PrivateRoute>
          } />
          
          <Route path="/settings" element={
            <PrivateRoute>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ ml: { md: '240px' } }}>
                  <MainNavBar />
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Sidebar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: { md: `calc(100% - 240px)` },
                    }}
                  >
                    <Settings />
                  </Box>
                </Box>
              </Box>
            </PrivateRoute>
          } />
          
          {/* Fallback route - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
