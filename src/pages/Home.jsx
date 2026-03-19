import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bot, Sparkles, ArrowRight, Brain, Target, Clock, FileCheck, Star, TrendingUp, Award } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Play(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function Home() {
  const { t } = useTranslation();

  const features = [
    { icon: Brain, color: 'from-purple-500 to-pink-500', title: t('home.features.aiPowered'), desc: t('home.features.aiPoweredDesc') },
    { icon: Target, color: 'from-cyan-500 to-blue-500', title: 'Accurate Predictions', desc: 'Get precise visa approval probability scores' },
    { icon: Clock, color: 'from-green-500 to-emerald-500', title: 'Save Time & Money', desc: "Know your chances before expensive applications" },
    { icon: FileCheck, color: 'from-orange-500 to-yellow-500', title: t('home.features.documents'), desc: t('home.features.documentsDesc') },
  ];

  const stats = [
    { number: '95%', label: 'Accuracy Rate' },
    { number: '50K+', label: 'Users Assisted' },
    { number: '30+', label: 'Countries Covered' },
    { number: '4.8★', label: 'User Rating' },
  ];

  const howItWorks = [
    { step: '1', title: 'Create Account', desc: 'Sign up in seconds with just your mobile number' },
    { step: '2', title: 'Complete Profile', desc: 'Enter your travel history, finances & documents' },
    { step: '3', title: 'Get Your Score', desc: 'Receive AI-powered eligibility assessment instantly' },
  ];

  const offers = [
    { icon: TrendingUp, color: 'green', title: 'Eligibility Score', desc: 'Get a percentage score showing your approval probability based on your profile, finances, and travel history.' },
    { icon: FileCheck, color: 'cyan', title: 'Document Scanner', desc: 'Scan your passport, bank statements, and employment documents. Create professional PDF packages.' },
    { icon: Award, color: 'purple', title: 'Action Plan', desc: 'Get personalized recommendations on what to improve - finances, travel history, or documentation.' },
  ];

  const testimonials = [
    { name: 'Ahmed K.', country: 'Morocco', text: '"Saved me from wasting €80 on a French visa I probably wouldn\'t have gotten."', initials: 'A', color: 'from-blue-500 to-purple-500' },
    { name: 'Priya S.', country: 'India', text: '"The document scanner is so convenient. I scanned everything from my phone."', initials: 'P', color: 'from-pink-500 to-red-500' },
    { name: 'Michael T.', country: 'Nigeria', text: '"Got my US visa approved after following the action plan. The 9-month roadmap worked!"', initials: 'M', color: 'from-green-500 to-teal-500' },
  ];

  const countries = ['🇪🇺 Schengen Area', '🇺🇸 United States', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇦🇺 Australia', '🇳🇿 New Zealand', '🇯🇵 Japan', '🇸🇬 Singapore', '🇦🇪 UAE'];

  return (
    <div className="min-h-screen ai-bg grid-pattern">
      <div className="particles">
        {[...Array(25)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
          }} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center glow pulse-glow">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">VisaGpt</h1>
              <p className="text-xs text-cyan-400">AI-Powered Visa Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/login" className="px-5 py-2 rounded-xl border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-all">
              {t('auth.signIn')}
            </Link>
          </div>
        </div>

        <div className="text-center mb-16 mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-purple-300">Powered by Advanced AI Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {t('home.heroTitle').split(' ').slice(0, 3).join(' ')}
            <span className="gradient-text"> {t('home.heroTitle').split(' ').slice(3).join(' ')}</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            {t('home.heroSubtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-4 text-lg glow-button">
              {t('home.getStarted')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="px-8 py-4 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all flex items-center gap-2">
              <Play size={20} />
              Watch Demo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{stat.number}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-4">{t('home.features.title')}</h2>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">We use cutting-edge AI to analyze hundreds of data points and give you the most accurate visa eligibility assessment.</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 card-hover">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 text-white`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {offers.map((offer, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 border border-gray-700">
                <div className={`w-12 h-12 rounded-xl bg-${offer.color}-500/20 flex items-center justify-center mb-4`}>
                  <offer.icon className={`w-6 h-6 text-${offer.color}-400`} />
                </div>
                <h3 className="text-white font-semibold mb-2">{offer.title}</h3>
                <p className="text-gray-400 text-sm">{offer.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">What Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((test, i) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm mb-4">{test.text}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${test.color} flex items-center justify-center text-white font-bold`}>
                    {test.initials}
                  </div>
                  <div>
                    <div className="text-white font-medium">{test.name}</div>
                    <div className="text-gray-500 text-xs">{test.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Supported Visa Types</h2>
          <p className="text-gray-400 mb-8">We analyze eligibility for visas to these popular destinations</p>
          <div className="flex flex-wrap justify-center gap-3">
            {countries.map((country, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-300 text-sm">
                {country}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-10 text-center glow mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">{t('home.heroTitle')}</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">Join thousands of users who made informed decisions about their visa applications.</p>
          <Link to="/register" className="btn-primary px-10 py-4 text-lg glow-button inline-flex items-center gap-2">
            {t('home.getStarted')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="text-center text-gray-500 text-sm pb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <span className="gradient-text font-semibold">VisaGpt</span>
          </div>
          <p>{t('footer.tagline')}</p>
          <p className="mt-2">{t('footer.rights')}</p>
        </div>
      </div>
    </div>
  );
}
