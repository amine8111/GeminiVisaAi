import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Applications() {
  const { getAuthHeaders, API_URL } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        headers: { ...getAuthHeaders() }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return 'text-green-400';
    if (prob >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 pt-20 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">My Applications</h1>
            <p className="text-gray-400">View and manage your visa applications</p>
          </div>
          <Link to="/eligibility-test" className="btn-primary">
            New Application
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400 mb-4">No applications yet.</p>
            <Link to="/eligibility-test" className="text-cyan-400 hover:underline">
              Start a new eligibility test
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{app.destination_country}</h3>
                    <p className="text-gray-400">{app.purpose_of_travel}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${app.application_status === 'Submitted' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {app.application_status}
                  </span>
                </div>

                <div className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Travel Dates:</span>
                    <p className="text-white">
                      {app.intended_travel_start} to {app.intended_travel_end}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Est. Cost:</span>
                    <p className="text-white">${app.estimated_trip_cost?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Probability:</span>
                    <p className={`font-semibold ${getProbabilityColor(app.success_probability)}`}>
                      {app.success_probability ? `${app.success_probability}%` : 'Not checked'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="text-white">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {app.advice_given && (
                  <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <span className="text-sm text-cyan-300">{app.advice_given}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;