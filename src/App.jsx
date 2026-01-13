import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/authContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Overview from './pages/Overview'
import Programs from './pages/Programs'
import Startups from './pages/Startups'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import MemberRegistration from './pages/MemberRegistration'
import MembersList from './pages/MembersList'
import MemberDetails from './pages/MemberDetails'
import MemberEdit from './pages/MemberEdit'
import TrashList from './pages/TrashList'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
        <Route path="/startups" element={<ProtectedRoute><Startups /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
        <Route path="/members/new" element={<ProtectedRoute><MemberRegistration /></ProtectedRoute>} />
        <Route path="/members/trash" element={<ProtectedRoute><TrashList /></ProtectedRoute>} />
        <Route path="/members/:memberId" element={<ProtectedRoute><MemberDetails /></ProtectedRoute>} />
        <Route path="/members/:memberId/edit" element={<ProtectedRoute><MemberEdit /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
