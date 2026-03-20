import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileUpdate from './pages/ProfileUpdate';
import EligibilityTest from './pages/EligibilityTest';
import Applications from './pages/Applications';
import Documents from './pages/Documents';
import DocumentManager from './pages/DocumentManager';
import Processing from './pages/Processing';
import Results from './pages/Results';
import Simulator from './pages/Simulator';
import FormFilling from './pages/FormFilling';
import Services from './pages/Services';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen ai-bg flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen ai-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/eligibility-test" element={<Navigate to="/login" replace />} />
          <Route path="/profile" element={<Navigate to="/login" replace />} />
          <Route path="/profile/update" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          <Route path="/applications" element={<Navigate to="/login" replace />} />
          <Route path="/documents" element={<Navigate to="/login" replace />} />
          <Route path="/documents/manage" element={<Navigate to="/login" replace />} />
          <Route path="/processing" element={<Navigate to="/login" replace />} />
          <Route path="/results" element={<Navigate to="/login" replace />} />
          <Route path="/simulator" element={<Navigate to="/login" replace />} />
          <Route path="/form-filling" element={<Navigate to="/login" replace />} />
          <Route path="/services" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/splash" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/update" element={<ProtectedRoute><ProfileUpdate /></ProtectedRoute>} />
        <Route path="/eligibility-test" element={<ProtectedRoute><EligibilityTest /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/documents/manage" element={<ProtectedRoute><DocumentManager /></ProtectedRoute>} />
        <Route path="/processing" element={<ProtectedRoute><Processing /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
        <Route path="/form-filling" element={<ProtectedRoute><FormFilling /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
// Fri Mar 20 03:29:41 MST 2026

