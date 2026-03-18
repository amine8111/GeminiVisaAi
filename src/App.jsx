import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Documents from './pages/Documents';
import Processing from './pages/Processing';
import Results from './pages/Results';

function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
