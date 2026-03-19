import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bot, UserPlus, Sparkles, ArrowRight, CheckCircle, Shield, Zap } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({
      mobile: formData.mobile,
      password: formData.password,
      email: '',
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: '',
      placeOfBirth: ''
    });

    if (!result.success) setError(result.error);
    setLoading(false);
  };

  const benefits = [
    'Free eligibility assessment',
    'Document scanner included',
    'Personalized action plan',
    'Track multiple applications',
  ];

  return (
    <div className="min-h-screen ai-bg grid-pattern">
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            background: i % 2 === 0 ? 'rgba(139, 92, 246, 0.6)' : 'rgba(34, 211, 238, 0.6)'
          }} />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">VisaGpt</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/login" className="px-5 py-2 rounded-xl gradient-bg text-white hover:opacity-90 transition-all">
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left - Info */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-purple-300">Free to Get Started</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Create Your <span className="gradient-text">Free Account</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of users who made informed decisions about their visa applications using AI.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-6 border-green-500/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Your Data is Safe</h3>
                  <p className="text-gray-400 text-sm">We use bank-level encryption to protect your personal information. We never share your data with third parties.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div>
            <div className="glass-card rounded-3xl p-8 glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create Account</h2>
                  <p className="text-gray-400 text-sm">It only takes 30 seconds</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="input"
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 glow-button mt-6"
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Create Free Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
