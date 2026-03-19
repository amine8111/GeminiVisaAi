import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Briefcase, DollarSign, Plane, Camera, CheckCircle, Loader2, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NATIONALITIES, MARITAL_STATUS, EMPLOYMENT_STATUS } from '../data/constants';

export default function Profile() {
  const navigate = useNavigate();
  const { getAuthHeaders, API_URL } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState(null);
  
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
    marital_status: '',
    employment_status: '',
    company_name: '',
    job_title: '',
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
        headers: { ...getAuthHeaders() }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, ...data }));
        if (data.passport_photo) {
          setPassportPhoto(data.passport_photo);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPassportPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPassportPhoto(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = { ...profile, passport_photo: passportPhoto };
      await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(profileData)
      });
    } catch (err) {
      console.error('Error saving profile:', err);
    }
    setSaving(false);
    navigate('/documents');
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const steps = [
    { num: 1, title: 'Personal', icon: User },
    { num: 2, title: 'Employment', icon: Briefcase },
    { num: 3, title: 'Financial', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="min-h-screen ai-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ai-bg grid-pattern pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Your Profile</h1>
          <p className="text-gray-400">Complete your profile to get accurate visa assessments</p>
        </div>

        <div className="flex items-center justify-between mb-8 overflow-x-auto">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="flex items-center flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  step >= s.num ? 'gradient-bg glow' : 'bg-gray-800'
                }`}>
                  <Icon className={`w-5 h-5 ${step >= s.num ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`ml-3 font-medium ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>
                  {s.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${step > s.num ? 'bg-purple-500' : 'bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="glass-card rounded-3xl p-8 glow">
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
              </div>

              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  {passportPhoto ? (
                    <div className="relative group">
                      <img src={passportPhoto} alt="Passport" className="w-32 h-32 rounded-xl object-cover border-2 border-purple-500" />
                      <button onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                      <Camera className="w-8 h-8 text-gray-500 mb-1" />
                      <span className="text-xs text-gray-500">Passport Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input type="text" value={profile.first_name || ''} onChange={(e) => handleChange('first_name', e.target.value)}
                    className="input" placeholder="John" />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input type="text" value={profile.last_name || ''} onChange={(e) => handleChange('last_name', e.target.value)}
                    className="input" placeholder="Doe" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" value={profile.date_of_birth || ''} onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className="input" />
                </div>
                <div>
                  <label className="label">Place of Birth</label>
                  <input type="text" value={profile.place_of_birth || ''} onChange={(e) => handleChange('place_of_birth', e.target.value)}
                    className="input" placeholder="City, Country" />
                </div>
              </div>

              <div>
                <label className="label">Nationality</label>
                <select value={profile.nationality || ''} onChange={(e) => handleChange('nationality', e.target.value)}
                  className="input">
                  <option value="">Select nationality</option>
                  {NATIONALITIES.VISA_FREE.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                  {NATIONALITIES.SCHENGEN_VISA_REQUIRED.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Marital Status</label>
                <select value={profile.marital_status || ''} onChange={(e) => handleChange('marital_status', e.target.value)}
                  className="input">
                  <option value="">Select marital status</option>
                  {MARITAL_STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Employment & Travel</h2>
              </div>

              <div>
                <label className="label">Employment Status</label>
                <select value={profile.employment_status || ''} onChange={(e) => handleChange('employment_status', e.target.value)}
                  className="input">
                  <option value="">Select employment status</option>
                  {EMPLOYMENT_STATUS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company Name</label>
                  <input type="text" value={profile.company_name || ''} onChange={(e) => handleChange('company_name', e.target.value)}
                    className="input" placeholder="Company Inc." />
                </div>
                <div>
                  <label className="label">Job Title</label>
                  <input type="text" value={profile.job_title || ''} onChange={(e) => handleChange('job_title', e.target.value)}
                    className="input" placeholder="Software Engineer" />
                </div>
              </div>

              <div>
                <label className="label">Monthly Income (USD)</label>
                <input type="number" value={profile.monthly_income || ''} onChange={(e) => handleChange('monthly_income', e.target.value)}
                  className="input" placeholder="5000" />
              </div>

              <div className="space-y-3">
                <label className="label flex items-center gap-2">
                  <Plane size={16} /> Travel History
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800">
                  <input type="checkbox" checked={profile.prior_international_travel} 
                    onChange={(e) => handleChange('prior_international_travel', e.target.checked)}
                    className="w-5 h-5 rounded" />
                  <span className="text-gray-300">Prior International Travel</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800">
                  <input type="checkbox" checked={profile.prior_schengen_visa} 
                    onChange={(e) => handleChange('prior_schengen_visa', e.target.checked)}
                    className="w-5 h-5 rounded" />
                  <span className="text-gray-300">Prior Schengen Visa</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800">
                  <input type="checkbox" checked={profile.prior_us_uk_canada_visa} 
                    onChange={(e) => handleChange('prior_us_uk_canada_visa', e.target.checked)}
                    className="w-5 h-5 rounded" />
                  <span className="text-gray-300">Prior US/UK/Canada Visa</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800">
                  <input type="checkbox" checked={profile.ever_refused_visa} 
                    onChange={(e) => handleChange('ever_refused_visa', e.target.checked)}
                    className="w-5 h-5 rounded" />
                  <span className="text-gray-300">Ever Refused Visa</span>
                </label>
                {profile.ever_refused_visa && (
                  <textarea value={profile.refusal_details || ''} onChange={(e) => handleChange('refusal_details', e.target.value)}
                    className="input" rows="3" placeholder="Please provide details about the refusal..." />
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Financial Information</h2>
              </div>

              <div>
                <label className="label">Average Bank Balance (Last 6 Months) - USD</label>
                <input type="number" value={profile.bank_balance_avg_6m || ''} onChange={(e) => handleChange('bank_balance_avg_6m', e.target.value)}
                  className="input" placeholder="10000" />
                <p className="text-gray-500 text-xs mt-1">This is a key factor in visa approval</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800">
                  <input type="checkbox" checked={profile.has_property} 
                    onChange={(e) => handleChange('has_property', e.target.checked)}
                    className="w-5 h-5 rounded" />
                  <div>
                    <span className="text-gray-300 block">Property Owner</span>
                    <span className="text-gray-500 text-xs">Shows strong ties to home country</span>
                  </div>
                </label>
                <div>
                  <label className="label">Number of Dependents</label>
                  <input type="number" value={profile.has_dependents || 0} onChange={(e) => handleChange('has_dependents', parseInt(e.target.value) || 0)}
                    className="input" min="0" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button type="button" onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5 hover:text-white transition-all">
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button type="button" onClick={handleNext}
                className="btn-primary flex items-center gap-2">
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button type="button" onClick={handleSave} disabled={saving}
                className="btn-primary flex items-center gap-2 glow-button">
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Save & Continue
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
