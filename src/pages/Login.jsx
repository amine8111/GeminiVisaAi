import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bot, Shield, Globe, Sparkles, ArrowRight, Brain, Zap } from 'lucide-react';

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
    <div className="min-h-screen ai-bg grid-pattern flex items-center justify-center p-4 overflow-hidden">
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: `rgba(${99 + Math.random() * 40}, ${102 + Math.random() * 30}, ${241}, ${0.3 + Math.random() * 0.4})`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center glow pulse-glow">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center float">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold gradient-text mb-3">GeminiVisa AI</h1>
          <div className="ai-badge inline-flex mb-4">
            <Brain size={14} />
            <span>AI-Powered Visa Assessment</span>
          </div>
          <p className="text-gray-400 text-lg">Your intelligent visa eligibility assistant</p>
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
              <label className="label">Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="input pl-12"
                  placeholder="Enter your mobile number"
                  required
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3 glow-button"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-8 mt-10">
          <div className="flex items-center gap-2 text-gray-500">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm">Secure</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span className="text-sm">Global</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-sm">AI-Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
