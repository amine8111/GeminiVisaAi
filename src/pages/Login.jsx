import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bot, Lock, Smartphone, ArrowRight, Loader2 } from 'lucide-react';

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
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen ai-bg grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center glow pulse-glow">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-4xl font-bold gradient-text mb-2">VisaGpt</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <div className="glass-card rounded-3xl p-8 glow">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile Number
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="input"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 glow-button mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <Link to="/" className="text-gray-500 hover:text-white text-sm transition-colors">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
