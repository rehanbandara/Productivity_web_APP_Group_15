import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import OAuthCallback from './pages/auth/OAuthCallback'


import UserBookings from './pages/user/UserBookings'
import AdminBookingManager from './pages/admin/AdminBookingManager'


import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import TechnicianDashboard from './pages/technician/TechnicianDashboard'


import ProfilePage from './components/ProfilePage'
import NotificationsPage from './components/NotificationsPage'


import ResourceCatalogue from './pages/user/ResourceCatalogue'
import AdminResources from './pages/admin/AdminResources'


import MyTicketsPage from './pages/user/MyTicketsPage'
import AdminTicketsPage from './pages/admin/AdminTicketsPage'
import TechnicianTicketsPage from './pages/technician/TechnicianTicketsPage'

import AdminUsersPage from './pages/admin/AdminUsersPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />


          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/user/dashboard" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user/notifications" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/user/profile" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/user/bookings" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserBookings />
            </ProtectedRoute>
          } />

          <Route path="/user/tickets" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyTicketsPage />
            </ProtectedRoute>
          } />

          <Route path="/user/resources" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <ResourceCatalogue />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminBookingManager />
            </ProtectedRoute>
          } />

          <Route path="/admin/tickets" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTicketsPage />
            </ProtectedRoute>
          } />


          <Route path="/admin/resources" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminResources />
            </ProtectedRoute>
          } />

          <Route path="/technician/dashboard" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          } />
          <Route path="/technician/notifications" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/technician/profile" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/technician/tickets" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianTicketsPage />
            </ProtectedRoute>
          } />

      
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
           <AdminUsersPage />
           </ProtectedRoute>
          } />

        </Routes>

        
        <Footer />

      

      </BrowserRouter>
    </AuthProvider>
  )
}
