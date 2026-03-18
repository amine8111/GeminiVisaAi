import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, User, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const location = useLocation();
  const { reset } = useApp();

  const handleNewAssessment = () => {
    reset();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold gradient-text">VisaAI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/home'
                ? 'bg-neon-purple/20 text-neon-purple'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Home size={18} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            to="/profile"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/profile'
                ? 'bg-neon-purple/20 text-neon-purple'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <User size={18} />
            <span className="hidden sm:inline">Profile</span>
          </Link>
          <Link
            to="/documents"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/documents'
                ? 'bg-neon-purple/20 text-neon-purple'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText size={18} />
            <span className="hidden sm:inline">Documents</span>
          </Link>
          <button
            onClick={handleNewAssessment}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
