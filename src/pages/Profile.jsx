import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Briefcase, DollarSign, Plane } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NATIONALITIES, MARITAL_STATUS, EMPLOYMENT_STATUS } from '../data/constants';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useApp();
  const [step, setStep] = useState(1);

  const handleChange = (field, value) => {
    updateProfile({ [field]: value });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    navigate('/documents');
  };

  const steps = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Employment' },
    { num: 3, title: 'Financial' },
  ];

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
          <p className="text-gray-400">Tell us about yourself to assess your visa chances</p>
        </div>

        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s.num
                    ? 'gradient-bg text-white'
                    : 'bg-navy-700 text-gray-400'
                }`}
              >
                {s.num}
              </div>
              <span
                className={`ml-2 hidden sm:inline ${
                  step >= s.num ? 'text-white' : 'text-gray-500'
                }`}
              >
                {s.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    step > s.num ? 'bg-neon-purple' : 'bg-navy-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-neon-purple" size={24} />
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
              </div>

              <div>
                <label className="label">Age</label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="Enter your age"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Nationality</label>
                <select
                  value={profile.nationality || ''}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  className="input"
                >
                  <option value="">Select nationality</option>
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Marital Status</label>
                <select
                  value={profile.maritalStatus || ''}
                  onChange={(e) => handleChange('maritalStatus', e.target.value)}
                  className="input"
                >
                  <option value="">Select marital status</option>
                  {MARITAL_STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="text-neon-purple" size={24} />
                <h2 className="text-xl font-semibold text-white">Employment & Travel</h2>
              </div>

              <div>
                <label className="label">Employment Status</label>
                <select
                  value={profile.employmentStatus || ''}
                  onChange={(e) => handleChange('employmentStatus', e.target.value)}
                  className="input"
                >
                  <option value="">Select employment status</option>
                  {EMPLOYMENT_STATUS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Monthly Income (USD)</label>
                <input
                  type="number"
                  value={profile.monthlyIncome || ''}
                  onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                  placeholder="Enter monthly income"
                  className="input"
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Plane size={16} /> Travel History
                </label>
                <input
                  type="number"
                  value={profile.travelHistory || 0}
                  onChange={(e) => handleChange('travelHistory', parseInt(e.target.value) || 0)}
                  min="0"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Previous Visa Refusals</label>
                <input
                  type="number"
                  value={profile.previousVisaRefusals || 0}
                  onChange={(e) => handleChange('previousVisaRefusals', parseInt(e.target.value) || 0)}
                  min="0"
                  className="input"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="text-neon-purple" size={24} />
                <h2 className="text-xl font-semibold text-white">Financial Information</h2>
              </div>

              <div>
                <label className="label">Bank Balance (USD)</label>
                <input
                  type="number"
                  value={profile.bankBalance || ''}
                  onChange={(e) => handleChange('bankBalance', e.target.value)}
                  placeholder="Total savings in USD"
                  className="input"
                />
                <p className="text-gray-500 text-xs mt-1">
                  This is a key factor in visa approval
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                Continue to Documents <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
