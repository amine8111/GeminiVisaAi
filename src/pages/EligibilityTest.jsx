import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
  const [error, setError] = useState('');
  const [applicationId, setApplicationId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      const application = await response.json();
      setApplicationId(application.id);

      const eligibilityResponse = await fetch(`${API_URL}/api/applications/${application.id}/eligibility`, {
        headers: { ...getAuthHeaders() }
      });

      if (!eligibilityResponse.ok) {
        throw new Error('Failed to check eligibility');
      }

      const eligibilityResult = await eligibilityResponse.json();
      setResult(eligibilityResult);
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
        a.download = `schengen_form_${applicationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to download form');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Visa Eligibility Test</h1>
        <p className="text-gray-600 mb-6">Check your visa eligibility probability before applying.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
              <select name="destination_country" value={formData.destination_country} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Travel</label>
              <select name="purpose_of_travel" value={formData.purpose_of_travel} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                <option value="">Select...</option>
                <option value="Tourism">Tourism</option>
                <option value="Business">Business</option>
                <option value="Visit Family">Visit Family</option>
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Transit">Transit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Start Date</label>
              <input type="date" name="intended_travel_start" value={formData.intended_travel_start} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel End Date</label>
              <input type="date" name="intended_travel_end" value={formData.intended_travel_end} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Trip Cost ($)</label>
              <input type="number" name="estimated_trip_cost" value={formData.estimated_trip_cost} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Analyzing...' : 'Check Eligibility'}
          </button>
        </form>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-indigo-600 mb-2">{result.probability}%</div>
              <p className="text-gray-600">Success Probability</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {result.reasons_high.map((reason, i) => (
                    <li key={i} className="text-green-700 text-sm">• {reason}</li>
                  ))}
                  {result.reasons_high.length === 0 && <li className="text-green-700 text-sm">None identified</li>}
                </ul>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Weaknesses</h3>
                <ul className="space-y-1">
                  {result.reasons_low.map((reason, i) => (
                    <li key={i} className="text-red-700 text-sm">• {reason}</li>
                  ))}
                  {result.reasons_low.length === 0 && <li className="text-red-700 text-sm">None identified</li>}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Advice</h3>
              <ul className="space-y-2">
                {result.advice.map((advice, i) => (
                  <li key={i} className="text-blue-700 text-sm">{advice}</li>
                ))}
              </ul>
            </div>

            <button onClick={downloadForm}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700">
              Generate & Download Schengen Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EligibilityTest;