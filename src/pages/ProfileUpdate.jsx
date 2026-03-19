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

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    } catch (err) {
      setMessage('Error updating profile');
    }
    setSaving(false);
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Management</h1>
        <p className="text-gray-400 mb-6">Update your personal, passport, employment, and travel information.</p>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">First Name</label>
                <input type="text" name="first_name" value={profile.first_name} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Middle Name</label>
                <input type="text" name="middle_name" value={profile.middle_name} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input type="text" name="last_name" value={profile.last_name} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange}
                  className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Place of Birth</label>
                <input type="text" name="place_of_birth" value={profile.place_of_birth} onChange={handleChange}
                  className="input" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Passport Details</h2>
            <p className="text-sm text-gray-500 mb-4">Passport scanning is simulated - please enter details manually</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Passport Number</label>
                <input type="text" name="passport_number" value={profile.passport_number} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Issue Country</label>
                <input type="text" name="passport_issue_country" value={profile.passport_issue_country} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Issue Date</label>
                <input type="date" name="passport_issue_date" value={profile.passport_issue_date} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Expiry Date</label>
                <input type="date" name="passport_expiry_date" value={profile.passport_expiry_date} onChange={handleChange}
                  className="input" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Employment Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Employment Status</label>
                <select name="employment_status" value={profile.employment_status} onChange={handleChange}
                  className="input">
                  <option value="">Select...</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Student">Student</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>
              <div>
                <label className="label">Company Name</label>
                <input type="text" name="company_name" value={profile.company_name} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input type="text" name="job_title" value={profile.job_title} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input type="date" name="start_date" value={profile.start_date} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Monthly Income ($)</label>
                <input type="number" name="monthly_income" value={profile.monthly_income} onChange={handleChange}
                  className="input" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Financial Details</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">Avg Bank Balance 6m ($)</label>
                <input type="number" name="bank_balance_avg_6m" value={profile.bank_balance_avg_6m} onChange={handleChange}
                  className="input" />
              </div>
              <div>
                <label className="label">Has Property</label>
                <input type="checkbox" name="has_property" checked={profile.has_property} onChange={handleChange}
                  className="w-5 h-5 mt-2" />
              </div>
              <div>
                <label className="label">Number of Dependents</label>
                <input type="number" name="has_dependents" value={profile.has_dependents} onChange={handleChange}
                  className="input" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Travel History</h2>
            <div className="space-y-3">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="prior_international_travel" checked={profile.prior_international_travel} onChange={handleChange}
                    className="mr-2 w-5 h-5" />
                  <span className="text-gray-300">Prior International Travel</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="prior_schengen_visa" checked={profile.prior_schengen_visa} onChange={handleChange}
                    className="mr-2 w-5 h-5" />
                  <span className="text-gray-300">Prior Schengen Visa</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="prior_us_uk_canada_visa" checked={profile.prior_us_uk_canada_visa} onChange={handleChange}
                    className="mr-2 w-5 h-5" />
                  <span className="text-gray-300">Prior US/UK/Canada Visa</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="ever_refused_visa" checked={profile.ever_refused_visa} onChange={handleChange}
                    className="mr-2 w-5 h-5" />
                  <span className="text-gray-300">Ever Refused Visa</span>
                </label>
              </div>
              {profile.ever_refused_visa && (
                <div className="mt-2">
                  <label className="label">Refusal Details</label>
                  <textarea name="refusal_details" value={profile.refusal_details} onChange={handleChange}
                    className="input" rows="3" />
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full btn-primary py-3">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileUpdate;