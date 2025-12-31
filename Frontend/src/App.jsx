import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import TermsAndPrivacy from './pages/TermsAndPrivacy';
import ContactPage from './pages/ContactPage';
import PasswordRecovery from './pages/PasswordRecovery';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<TermsAndPrivacy />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/password-recovery" element={<PasswordRecovery />} />
        <Route path="/soon" element={<ComingSoon />} />
      </Routes>
    </Router>
  );
}

export default App
