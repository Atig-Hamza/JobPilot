import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import Authenticate from './middleware/authenticate';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';
import { PageSkeleton } from './components/Skeleton';
import SpinnerLoader from './components/SpinnerLoader';
import PageTitle from './components/PageTitle';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const TermsAndPrivacy = lazy(() => import('./pages/TermsAndPrivacy'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PasswordRecovery = lazy(() => import('./pages/PasswordRecovery'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const NotFound = lazy(() => import('./pages/404'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const AutoPilotAgent = lazy(() => import('./pages/user/AutoPilotAgent'));
const PortalSelection = lazy(() => import('./pages/admin/Portal'));
const AdminLayout = lazy(() => import('./pages/admin/components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const WaitlistRequests = lazy(() => import('./pages/admin/WaitlistRequests'));
const AccessManagement = lazy(() => import('./pages/admin/AccessManagement'));
const InterviewCoach = lazy(() => import('./pages/user/InterviewCoach'));
const Onboarding = lazy(() => import('./pages/user/Onboarding'));

const Page = ({ title, children }) => (
  <>
    <PageTitle title={title} />
    {children}
  </>
);

const SpinnerLayout = () => (
  <Suspense fallback={<SpinnerLoader />}>
    <Outlet />
  </Suspense>
);

function App() {
  const { theme } = useTheme();

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#18181b' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: theme === 'dark' ? '1px solid #27272a' : '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: theme === 'dark' ? '#fff' : '#000',
              secondary: theme === 'dark' ? '#000' : '#fff',
            },
          },
        }}
      />

      <Router>
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<PageSkeleton />}>
              <Page title="JobPilot - Home"><Home /></Page>
            </Suspense>
          } />
          <Route element={<SpinnerLayout />}>
            <Route path="*" element={<Page title="404 - Not Found"><NotFound /></Page>} />
            <Route path="/login" element={<Page title="Login - JobPilot"><Login /></Page>} />
            <Route path="/signup" element={<Page title="Sign Up - JobPilot"><Signup /></Page>} />
            <Route path="/privacy" element={<Page title="Privacy & Terms - JobPilot"><TermsAndPrivacy /></Page>} />
            <Route path="/contact" element={<Page title="Contact Us - JobPilot"><ContactPage /></Page>} />
            <Route path="/password-recovery" element={<Page title="Password Recovery - JobPilot"><PasswordRecovery /></Page>} />
            <Route path="/soon" element={<Page title="Coming Soon - JobPilot"><ComingSoon /></Page>} />

            <Route element={<Authenticate allowedRoles={['user', 'admin']} />}>
              <Route path="/user/onboarding" element={<Page title="Onboarding - JobPilot"><Onboarding /></Page>} />
              <Route path="/user/dashboard" element={<Page title="Dashboard - JobPilot"><UserDashboard /></Page>} />
              <Route path="/user/autopilot" element={<Page title="AutoPilot - JobPilot"><AutoPilotAgent /></Page>} />
              <Route path="/user/interview-coach" element={<Page title="Interview Coach - JobPilot"><InterviewCoach /></Page>} />
            </Route>

            <Route element={<Authenticate allowedRoles={['admin']} />}>
              <Route path="/admin/portal" element={<Page title="Admin Portal - JobPilot"><PortalSelection /></Page>} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Page title="Admin Dashboard - JobPilot"><AdminDashboard /></Page>} />
                <Route path="waitlist" element={<Page title="Waitlist Requests - JobPilot"><WaitlistRequests /></Page>} />
                <Route path="access-codes" element={<Page title="Access Management - JobPilot"><AccessManagement /></Page>} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App
