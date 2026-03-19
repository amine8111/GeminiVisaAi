import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, User, Clipboard, FolderOpen, LogOut, Menu, X, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/eligibility-test', label: 'Assessment', icon: Clipboard },
    { path: '/simulator', label: 'Simulator', icon: Clipboard },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/applications', label: 'Applications', icon: FolderOpen },
  ];

  if (!user) return null;

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">VisaGpt</span>
              <span className="block text-xs text-gray-500 -mt-1">AI-Powered</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'gradient-bg text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={16} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all ml-2"
            >
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1 border-t border-white/10 pt-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                  location.pathname === item.path
                    ? 'gradient-bg text-white'
                    : 'text-gray-400'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
