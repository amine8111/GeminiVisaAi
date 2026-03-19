import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileDown, Target, TrendingUp, Calendar, CheckCircle, AlertCircle, Bell, Mail, MessageSquare } from 'lucide-react';

function EligibilityTest() {
  const { getAuthHeaders, API_URL } = useAuth();
  const [formData, setFormData] = useState({
    destination_country: '',
    purpose_of_travel: '',
    intended_travel_start: '',
    estimated_trip_cost: '',
    intended_travel_end: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [milestonePlan, setMilestonePlan] = useState(null);
  const [error, setError] = useState('');
  const [applicationId, setApplicationId] = useState(null);
  const [showMilestones, setShowMilestones] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({ email: true, sms: false, whatsapp: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setMilestonePlan(null);

    try {
      // Create application
      const response = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create application');

      const application = await response.json();
      setApplicationId(application.id);

      // Check eligibility
      const eligibilityResponse = await fetch(`${API_URL}/api/applications/${application.id}/eligibility`, {
        headers: { ...getAuthHeaders() }
      });

      if (!eligibilityResponse.ok) throw new Error('Failed to check eligibility');

      const eligibilityResult = await eligibilityResponse.json();
      setResult(eligibilityResult);

      // Get milestone plan if score is low
      if (eligibilityResult.probability < 70) {
        const milestoneResponse = await fetch(`${API_URL}/api/applications/${application.id}/milestone-plan`, {
          headers: { ...getAuthHeaders() }
        });
        if (milestoneResponse.ok) {
          const plan = await milestoneResponse.json();
          setMilestonePlan(plan.milestone_plan);
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const downloadForm = async () => {
    if (!applicationId) return;
    try {
      const response = await fetch(`${API_URL}/api/generate-schengen-form/${applicationId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schengen_visa_form_${applicationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to download form');
    }
  };

  const subscribeNotifications = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          channels: notificationSettings,
          enabled: true
        })
      });
      alert('Notification preferences saved!');
    } catch (err) {
      console.error('Failed to save preferences');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    if (score >= 40) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="min-h-screen ai-bg grid-pattern py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card glow-accent mb-3">
            <Target className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">AI Visa Eligibility Assessment</h1>
          <p className="text-gray-400 mt-1">Get your probability score and personalized action plan</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        {!result && (
          <div className="glass-card rounded-2xl p-6 glow mb-8">
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Destination Country</label>
                  <select name="destination_country" value={formData.destination_country} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg" required>
                    <option value="">Select...</option>
                    <option value="Schengen">Schengen Area</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Italy">Italy</option>
                    <option value="Spain">Spain</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Purpose of Travel</label>
                  <select name="purpose_of_travel" value={formData.purpose_of_travel} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg" required>
                    <option value="">Select...</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Business">Business</option>
                    <option value="Visit Family">Visit Family</option>
                    <option value="Study">Study</option>
                    <option value="Work">Work</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Travel Start Date</label>
                  <input type="date" name="intended_travel_start" value={formData.intended_travel_start} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Travel End Date</label>
                  <input type="date" name="intended_travel_end" value={formData.intended_travel_end} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Trip Cost ($)</label>
                  <input type="number" name="estimated_trip_cost" value={formData.estimated_trip_cost} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg" required />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary glow-button rounded-lg">
                {loading ? 'Analyzing your profile...' : 'Check Eligibility'}
              </button>
            </form>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Score Display */}
            <div className="glass-card rounded-2xl p-8 glow text-center">
              <div className="relative inline-block mb-4">
                <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${getScoreBg(result.probability)} flex items-center justify-center p-1`}>
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <span className={`text-5xl font-bold ${getScoreColor(result.probability)}`}>
                      {result.probability}%
                    </span>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Eligibility Score</h2>
              <p className="text-gray-400">
                {result.probability >= 80 ? 'Excellent chance of approval!' :
                 result.probability >= 60 ? 'Good chance, but some improvements needed' :
                 result.probability >= 40 ? 'Moderate chance - follow the action plan below' :
                 'Low chance - focus on strengthening your profile'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={downloadForm}
                className="glass-card rounded-xl p-6 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <FileDown className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white group-hover:text-cyan-400">Download Visa Form</h3>
                    <p className="text-sm text-gray-400">Pre-filled Schengen application</p>
                  </div>
                </div>
              </button>

              {(milestonePlan || result.probability < 70) && (
                <button onClick={() => setShowMilestones(!showMilestones)}
                  className="glass-card rounded-xl p-6 hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-white group-hover:text-cyan-400">View Action Plan</h3>
                      <p className="text-sm text-gray-400">Personalized milestones</p>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Reasons */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-bold text-green-400 flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {result.reasons_high.map((reason, i) => (
                    <li key={i} className="text-gray-300 text-sm">• {reason}</li>
                  ))}
                  {result.reasons_high.length === 0 && <li className="text-gray-500 text-sm">None identified</li>}
                </ul>
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-bold text-red-400 flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5" /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {result.reasons_low.map((reason, i) => (
                    <li key={i} className="text-gray-300 text-sm">• {reason}</li>
                  ))}
                  {result.reasons_low.length === 0 && <li className="text-gray-500 text-sm">None identified</li>}
                </ul>
              </div>
            </div>

            {/* Advice */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-bold text-cyan-400 flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" /> AI Recommendations
              </h3>
              <ul className="space-y-2">
                {result.advice.map((advice, i) => (
                  <li key={i} className="text-gray-300 text-sm">• {advice}</li>
                ))}
              </ul>
            </div>

            {/* Milestone Plan */}
            {showMilestones && milestonePlan && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-bold text-white text-xl mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-cyan-400" /> Your 9-Month Action Plan
                </h3>
                
                {/* Notification Settings */}
                <div className="mb-6 p-4 rounded-lg bg-gray-800/50">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Get milestone reminders:
                  </h4>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={notificationSettings.email} 
                        onChange={(e) => setNotificationSettings({...notificationSettings, email: e.target.checked})}
                        className="w-4 h-4" />
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={notificationSettings.sms} 
                        onChange={(e) => setNotificationSettings({...notificationSettings, sms: e.target.checked})}
                        className="w-4 h-4" />
                      <span className="text-sm text-gray-300">SMS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={notificationSettings.whatsapp} 
                        onChange={(e) => setNotificationSettings({...notificationSettings, whatsapp: e.target.checked})}
                        className="w-4 h-4" />
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">WhatsApp</span>
                    </label>
                    <button onClick={subscribeNotifications} className="ml-4 btn-primary text-sm py-1 px-3">
                      Save
                    </button>
                  </div>
                </div>

                {/* Milestones Timeline */}
                <div className="relative">
                  {milestonePlan.milestones.map((milestone, i) => (
                    <div key={i} className="relative pl-8 pb-6">
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                      {i < milestonePlan.milestones.length - 1 && (
                        <div className="absolute left-3 top-6 w-0.5 h-full bg-cyan-500/30"></div>
                      )}
                      <div className="glass rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-cyan-400 font-medium">{milestone.phase}</span>
                          <span className="text-xs text-gray-500">Week {milestone.week}</span>
                        </div>
                        <h4 className="font-bold text-white mb-1">{milestone.title}</h4>
                        <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
                        <div className="text-xs text-gray-500">
                          <strong>Action items:</strong>
                          <ul className="mt-1 ml-4">
                            {milestone.action_items.map((item, j) => (
                              <li key={j}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <p className="text-sm text-cyan-300">
                    🎯 Estimated completion: {milestonePlan.estimated_completion}
                  </p>
                </div>
              </div>
            )}

            {/* New Assessment Button */}
            <button onClick={() => { setResult(null); setMilestonePlan(null); setApplicationId(null); }}
              className="w-full py-3 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-cyan-500 transition-all">
              Start New Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EligibilityTest;