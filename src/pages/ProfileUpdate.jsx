import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function ProfileUpdate() {
  const { getAuthHeaders, API_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [profile, setProfile] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    place_of_birth: '',
    passport_number: '',
    passport_issue_country: '',
    passport_issue_date: '',
    passport_expiry_date: '',
    employment_status: '',
    company_name: '',
    job_title: '',
    start_date: '',
    monthly_income: '',
    bank_balance_avg_6m: '',
    has_property: false,
    has_dependents: 0,
    prior_international_travel: false,
    prior_schengen_visa: false,
    prior_us_uk_canada_visa: false,
    ever_refused_visa: false,
    refusal_details: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile, ...data });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Management</h1>
        <p className="text-gray-600 mb-6">Update your personal, passport, employment, and travel information.</p>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" name="first_name" value={profile.first_name} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input type="text" name="middle_name" value={profile.middle_name} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" name="last_name" value={profile.last_name} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
                <input type="text" name="place_of_birth" value={profile.place_of_birth} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Passport Details</h2>
            <p className="text-sm text-gray-500 mb-4">Passport scanning is simulated - please enter details manually</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                <input type="text" name="passport_number" value={profile.passport_number} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Country</label>
                <input type="text" name="passport_issue_country" value={profile.passport_issue_country} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                <input type="date" name="passport_issue_date" value={profile.passport_issue_date} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input type="date" name="passport_expiry_date" value={profile.passport_expiry_date} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Employment Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                <select name="employment_status" value={profile.employment_status} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Select...</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Student">Student</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" name="company_name" value={profile.company_name} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input type="text" name="job_title" value={profile.job_title} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" name="start_date" value={profile.start_date} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Income ($)</label>
                <input type="number" name="monthly_income" value={profile.monthly_income} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Details</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Avg Bank Balance 6m ($)</label>
                <input type="number" name="bank_balance_avg_6m" value={profile.bank_balance_avg_6m} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Has Property</label>
                <input type="checkbox" name="has_property" checked={profile.has_property} onChange={handleChange}
                  className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Dependents</label>
                <input type="number" name="has_dependents" value={profile.has_dependents} onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Travel History</h2>
            <div className="space-y-3">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="prior_international_travel" checked={profile.prior_international_travel} onChange={handleChange}
                    className="mr-2" />
                  <span className="text-gray-700">Prior International Travel</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="prior_schengen_visa" checked={profile.prior_schengen_visa} onChange={handleChange}
                    className="mr-2" />
                  <span className="text-gray-700">Prior Schengen Visa</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="prior_us_uk_canada_visa" checked={profile.prior_us_uk_canada_visa} onChange={handleChange}
                    className="mr-2" />
                  <span className="text-gray-700">Prior US/UK/Canada Visa</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="ever_refused_visa" checked={profile.ever_refused_visa} onChange={handleChange}
                    className="mr-2" />
                  <span className="text-gray-700">Ever Refused Visa</span>
                </label>
              </div>
              {profile.ever_refused_visa && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Refusal Details</label>
                  <textarea name="refusal_details" value={profile.refusal_details} onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" />
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileUpdate;