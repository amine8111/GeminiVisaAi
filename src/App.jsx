import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileUpdate from './pages/ProfileUpdate';
import EligibilityTest from './pages/EligibilityTest';
import Applications from './pages/Applications';
import DocumentManager from './pages/DocumentManager';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileUpdate /></ProtectedRoute>} />
        <Route path="/eligibility-test" element={<ProtectedRoute><EligibilityTest /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentManager /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;