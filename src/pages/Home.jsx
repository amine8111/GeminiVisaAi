import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, FileText, Shield, Globe } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Risk Analysis',
      description: 'Identify potential issues in your visa application',
    },
    {
      icon: Globe,
      title: 'Country Matching',
      description: 'Find the best countries for your profile',
    },
    {
      icon: FileText,
      title: 'Document Check',
      description: 'Ensure you have all required documents',
    },
  ];

  const handleStartAssessment = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Visa</span> Approval
            <br />
            Probability Score
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Assess your visa approval chances before you apply. Get personalized
            recommendations and action plans to improve your profile.
          </p>
          <button
            onClick={handleStartAssessment}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
          >
            Check My Visa Chances
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="card p-6 hover:border-neon-purple/50 transition-colors">
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="card p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Create Profile', desc: 'Enter your personal details' },
              { step: '2', title: 'Upload Documents', desc: 'Add supporting documents' },
              { step: '3', title: 'Get Score', desc: 'Receive your probability score' },
              { step: '4', title: 'Take Action', desc: 'Follow recommendations to improve' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
            <CheckCircle size={20} />
            <span>Free to use</span>
          </div>
          <p className="text-gray-500 text-sm">
            Disclaimer: This tool provides estimated probabilities and does not guarantee visa approval.
          </p>
        </div>
      </div>
    </div>
  );
}
