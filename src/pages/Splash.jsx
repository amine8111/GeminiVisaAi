import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        navigate(user ? '/dashboard' : '/login', { replace: true });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  return (
    <div className="fixed inset-0 ai-bg flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="w-28 h-28 rounded-3xl gradient-bg flex items-center justify-center glow pulse-glow">
            <Bot className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cyan-400 animate-pulse"></div>
        </div>
        <h1 className="text-5xl font-bold gradient-text mb-2">VisaGpt</h1>
        <p className="text-gray-400 text-lg mb-1">AI-Powered Visa Intelligence</p>
        <p className="text-gray-500 text-sm">Know your chances before you apply</p>
        <div className="mt-8 flex justify-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
