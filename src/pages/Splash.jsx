import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && !loading) {
      navigate(user ? '/dashboard' : '/login', { replace: true });
    }
  }, [showSplash, loading, user, navigate]);

  if (!showSplash) return null;

  return (
    <div className="fixed inset-0 bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-bg flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-4xl">V</span>
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-2">VisaAI</h1>
        <p className="text-gray-400">Assess Your Visa Chances</p>
        <div className="mt-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
