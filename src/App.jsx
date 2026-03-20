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
  
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
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
