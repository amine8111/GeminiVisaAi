import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  const menuItems = [
    { title: 'Profile Management', description: 'Update your personal and travel information', link: '/profile', icon: '👤' },
    { title: 'Eligibility Test', description: 'Check your visa eligibility probability', link: '/eligibility-test', icon: '🎯' },
    { title: 'My Applications', description: 'View and manage your visa applications', link: '/applications', icon: '📋' },
    { title: 'Document Manager', description: 'Upload and track your documents', link: '/documents', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Welcome to GeminiVisaAI</h1>
          <p className="mt-2 text-lg">Your intelligent visa application assistant</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Hello, {user?.email || user?.mobile}!</h2>
          <p className="text-gray-600 mt-2">Manage your visa applications, check eligibility, and track documents all in one place.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
            >
              <div className="flex items-start">
                <span className="text-3xl mr-4">{item.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800">Quick Tips</h3>
          <ul className="mt-3 space-y-2 text-blue-700">
            <li>• Complete your profile with accurate information for better eligibility results</li>
            <li>• Upload clear scans of your documents for faster processing</li>
            <li>• Check your eligibility before applying to improve your chances</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;