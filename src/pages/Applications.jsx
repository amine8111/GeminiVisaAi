import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Applications() {
  const { getAuthHeaders, API_URL } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        headers: { ...getAuthHeaders() }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return 'text-green-600';
    if (prob >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
            <p className="text-gray-600">View and manage your visa applications</p>
          </div>
          <Link to="/eligibility-test" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            New Application
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No applications yet.</p>
            <Link to="/eligibility-test" className="text-indigo-600 hover:underline">
              Start a new eligibility test
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{app.destination_country}</h3>
                    <p className="text-gray-600">{app.purpose_of_travel}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.application_status)}`}>
                    {app.application_status}
                  </span>
                </div>

                <div className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Travel Dates:</span>
                    <p className="text-gray-800">
                      {app.intended_travel_start} to {app.intended_travel_end}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Est. Cost:</span>
                    <p className="text-gray-800">${app.estimated_trip_cost?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Probability:</span>
                    <p className={`font-semibold ${getProbabilityColor(app.success_probability)}`}>
                      {app.success_probability ? `${app.success_probability}%` : 'Not checked'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="text-gray-800">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {app.advice_given && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-800">{app.advice_given}</span>
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