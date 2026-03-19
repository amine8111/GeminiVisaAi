import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bot, Shield, Globe } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(mobile, password);
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen ai-bg grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-card glow-accent mb-4">
            <Bot className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">GeminiVisaAI</h1>
          <p className="text-gray-400 mt-2">AI-Powered Visa Eligibility Assistant</p>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-8 glow">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mobile Number
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary glow-button rounded-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Register here
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="flex justify-center gap-6 mt-8 text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-xs">Global</span>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span className="text-xs">AI-Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;