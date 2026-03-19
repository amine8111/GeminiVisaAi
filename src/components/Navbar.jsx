import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, User, Clipboard, FolderOpen, LogOut, Menu, X } from 'lucide-react';
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
    { path: '/eligibility-test', label: 'Eligibility Test', icon: Clipboard },
    { path: '/simulator', label: 'Simulator', icon: Clipboard },
    { path: '/applications', label: 'Applications', icon: FolderOpen },
    { path: '/documents', label: 'Documents', icon: FileText },
  ];

  if (!user) return null;

  return (
    <nav className="bg-indigo-600 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold">GeminiVisaAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-200 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/80'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-200 w-full"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}