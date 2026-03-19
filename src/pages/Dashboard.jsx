import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, FileText, Clipboard, FolderOpen, Sparkles, TrendingUp, FileSignature } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuItems = [
    { title: t('dashboard.eligibilityTest.title'), description: t('dashboard.eligibilityTest.description'), link: '/eligibility-test', icon: Target, color: 'from-purple-500 to-pink-500' },
    { title: t('dashboard.documentScanner.title'), description: t('dashboard.documentScanner.description'), link: '/documents', icon: FileText, color: 'from-cyan-500 to-blue-500' },
    { title: t('dashboard.simulator.title'), description: t('dashboard.simulator.description'), link: '/simulator', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { title: t('dashboard.formFilling.title'), description: t('dashboard.formFilling.description'), link: '/form-filling', icon: FileSignature, color: 'from-indigo-500 to-purple-500' },
    { title: t('dashboard.myApplications.title'), description: t('dashboard.myApplications.description'), link: '/applications', icon: FolderOpen, color: 'from-orange-500 to-yellow-500' },
    { title: t('dashboard.profileManagement.title'), description: t('dashboard.profileManagement.description'), link: '/profile', icon: Clipboard, color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen ai-bg grid-pattern pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-purple-300">{t('dashboard.welcome')}</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            {t('dashboard.hello')}, {user?.first_name || user?.mobile || 'User'}!
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold gradient-text">4.8</div>
            <div className="text-gray-400 text-sm">{t('dashboard.aiAccuracy')}</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold gradient-text">30+</div>
            <div className="text-gray-400 text-sm">{t('dashboard.countries')}</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold gradient-text">50K+</div>
            <div className="text-gray-400 text-sm">{t('dashboard.users')}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="glass-card rounded-2xl p-6 card-hover group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 mt-10 text-center border-cyan-500/30">
          <h3 className="text-xl font-bold text-white mb-2">{t('dashboard.cta.title')}</h3>
          <p className="text-gray-400 mb-4">{t('dashboard.cta.subtitle')}</p>
          <Link to="/eligibility-test" className="btn-primary inline-flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t('dashboard.cta.button')}
          </Link>
        </div>

        <div className="mt-10 text-center">
          <h3 className="text-white font-semibold mb-4">{t('dashboard.supportedCountries')}</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {['🇪🇺 Schengen', '🇺🇸 USA', '🇬🇧 UK', '🇨🇦 Canada', '🇦🇺 Australia', '🇳🇿 NZ', '🇯🇵 Japan', '🇸🇬 Singapore', '🇦🇪 UAE'].map((country, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700 text-gray-300 text-sm">
                {country}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
