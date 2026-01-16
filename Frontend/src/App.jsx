import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import TermsAndPrivacy from './pages/TermsAndPrivacy';
import ContactPage from './pages/ContactPage';
import PasswordRecovery from './pages/PasswordRecovery';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/404';
import UserDashboard from './pages/user/UserDashboard';
import AutoPilotAgent from './pages/user/AutoPilotAgent';
import PortalSelection from './pages/admin/Portal';
import AdminLayout from './pages/admin/components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import WaitlistRequests from './pages/admin/WaitlistRequests';
import AccessManagement from './pages/admin/AccessManagement';
import Authenticate from './middleware/authenticate';
import Preloader from './components/Preloader';
import InterviewCoach from './pages/user/InterviewCoach';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Preloader onComplete={() => setLoading(false)} />
      <Router>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<TermsAndPrivacy />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="/soon" element={<ComingSoon />} />

          <Route element={<Authenticate allowedRoles={['user', 'admin']} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/autopilot" element={<AutoPilotAgent />} />
            <Route path="/user/interview-coach" element={<InterviewCoach />} />
          </Route>

          <Route element={<Authenticate allowedRoles={['admin']} />}>
            <Route path="/admin/portal" element={<PortalSelection />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="waitlist" element={<WaitlistRequests />} />
              <Route path="access-codes" element={<AccessManagement />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App
